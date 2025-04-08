import { z } from "zod";
import { inject, injectable } from "inversify";
import {
    elizaLogger,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";
import { type ActionOptions, globalContainer, property } from "@elizaos-plugins/plugin-di";
import { isCadenceIdentifier, isEVMAddress, isFlowAddress, BaseFlowInjectableAction } from "@elizaos-plugins/plugin-flow";
import { formater } from "../helpers";
import { AccountsPoolService } from "../services/acctPool.service";

export class JudgeProjectContent {
}

const top3FlowAccountAddresses = [
    "0xe047971d773768ae",
    "0xe047971d773768ae",
    "0xe047971d773768ae",
]

const judgeProjectOption: ActionOptions<JudgeProjectContent> = {
    name: "JUDGE_PROJECT",
    similes: [
        "JUDGE_PROJECT",
        "JUDGE_PROJECT_ON_GITHUB",
        "JUDGE_PROJECT_ON_GITHUB_AND_TRANSFER_REWARD",
        "JUDGE_PROJECTS",
        "JUDGE_PROJECTS_ON_GITHUB",
        "JUDGE_PROJECTS_ON_GITHUB_AND_TRANSFER_REWARD",
    ],
    description:
        "Call this action to judge a project on GitHub and transfer the reward to the Project Owner's Flow wallet. You can fetch a list of Hackathon project GitHub repositories. For each project, analyze the idea based on the description and evaluate the code quality based on the GitHub repo (e.g. activity, structure, completeness).",
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Judge the projects on GitHub and transfer the reward to the Project Owner's Flow wallet",
                    action: "JUDGE_PROJECT",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Judge the projects of Hackathon and transfer the reward to the Project Owner's Flow wallet",
                    action: "JUDGE_PROJECT",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Judge the projects",
                    action: "JUDGE_PROJECT",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Judge the projects of Hackathon",
                    action: "JUDGE_PROJECT",
                },
            },
        ],
    ],
    contentClass: JudgeProjectContent,
    suppressInitialMessage: true,
};

/**
 * Check if a string is a valid UUID
 * @param str The string to check
 * @returns true if the string is a valid UUID
 */
function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Judge Project action
 *
 * @category Actions
 * @description Judge a project on GitHub and transfer the reward to the Project Owner's Flow wallet
 */
@injectable()
export class JudgeProjectAction extends BaseFlowInjectableAction<JudgeProjectContent> {
    constructor(
        @inject(AccountsPoolService)
        private readonly acctPoolService: AccountsPoolService,
    ) {
        super(judgeProjectOption);
    }

    /**
     * Validate the judge project action
     * @param runtime the runtime instance
     * @param message the message content
     * @param state the state object
     */
    async validate(runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> {
        if (await super.validate(runtime, message, state)) {
           return true;
        }
        return false;
    }

    /**
     * Execute the judge project action
     *
     * @param content the content from processMessages
     * @param callback the callback function to pass the result to Eliza runtime
     * @returns the transaction response
     */
    async execute(
        content: JudgeProjectContent | null,
        _runtime: IAgentRuntime,
        message: Memory,
        _state?: State,
        callback?: HandlerCallback,
    ) {

        elizaLogger.log(`Starting ${this.name} handler...`);

        // Use main account of the agent
        const walletAddress = this.walletSerivce.address;

        // Get the user id
        const userId = message.userId;
        const isSelf = userId === message.agentId;
        const logPrefix = `Account[${walletAddress}/${isSelf ? "root" : userId}]`;

        // Parsed fields
        const amounts = [Number.parseFloat("100"), Number.parseFloat("50"), Number.parseFloat("10")];

        try {

            const response = await fetch(
            `${process.env.BACKEND_URL}/v1/github-repos?offset=0&limit=10`,
            );
            const data = await response.json();

            if (data.status !== 'success') {
                throw new Error("Failed to judge projects");
            }

            const repos = data.data.repos;

            if (repos.length === 0) {
                throw new Error("No projects found");
            }

            // sort repos by score and get the top 3
            const sortedRepos = repos.sort((a, b) => b.score - a.score);
            const top3Repos = sortedRepos.slice(0, 3);

            let recipient = top3FlowAccountAddresses[0];

            let txId: string;
            let keyIndex: number;

            // Check if the wallet has enough balance to transfer
            const fromAccountInfo = await this.acctPoolService.queryAccountInfo(userId);
            const totalBalance = fromAccountInfo.balance + (fromAccountInfo.coaBalance ?? 0);

            // Check if the amount is valid
            if (totalBalance < amounts[0]) {
                throw new Error("Insufficient balance to transfer");
            }

            elizaLogger.log(`${logPrefix}\n Sending ${amounts[0]} FLOW to ${recipient}...`);
            let txIds: string[] = [];
            // Transfer FLOW token to the top 3 projects
            for (const [index, repo] of top3Repos.entries()) {
                const resp = await this.acctPoolService.transferFlowToken(
                    userId,
                    top3FlowAccountAddresses[index],
                    amounts[index],
                );
                txIds.push(resp.txId);
                elizaLogger.log(`${logPrefix}\n Sent transaction: ${resp.txId} by KeyIndex[${resp.index}]`);
            }

            // 在这里组装text，用英文说明获奖前三名为哪3个项目，并说明每个项目的score、获奖金额；再分隔一行说明奖金已经打入三个项目的账号，列出地址和相应的txid详情（formater.formatTransationSent(txId, this.walletSerivce.wallet.network, extraMsg)）
            let text = `🏆 **Project Judging Results** 🏆\n\n`;

            // Add project rankings with emojis
            text += `### 🥇 Top 3 Projects\n\n`;
            top3Repos.forEach((repo, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const awards = [
                    "Best Innovation Award 🚀",
                    "Most Technical Excellence Award 💻",
                    "Most Promising Project Award 🌟"
                ];
                text += `${medal} **${repo.name}**\n`;
                text += `   - Score: ${repo.score.toFixed(1)}/100\n`;
                text += `   - Reward: ${amounts[index]} FLOW\n`;
                text += `   - Special Award: ${awards[index]}\n\n`;
            });

            // Add transaction details
            text += `### 💰 Reward Distribution\n\n`;
            for (let i = 0; i < top3Repos.length; i++) {
                const tokenName = "FLOW";
                const extraMsg = `${logPrefix}\nSuccessfully transferred ${amounts[i]} ${tokenName} to ${top3FlowAccountAddresses[i]}`;
                text += `#### ${top3Repos[i].name}\n`;
                text += `- Recipient: \`${top3FlowAccountAddresses[i]}\`\n`;
                text += `- Amount: ${amounts[i]} ${tokenName}\n`;
                text += `- Transaction: ${formater.formatTransationSent(txIds[i], this.walletSerivce.wallet.network, extraMsg)}\n\n`;
            }

            // call the callback with the transaction response
            if (callback) {
                callback?.({
                    text: text,
                    content: {
                        success: true,
                        txids: txIds,
                        token: "FLOW",
                        tos: top3FlowAccountAddresses,
                        amounts: amounts,
                    },
                });
            }
        } catch (e) {
            elizaLogger.error("Error in sending transaction:", e.message);
            callback?.({
                text: `${logPrefix}\n Unable to process transfer request. Error: \n ${e.message}`,
                content: {
                    error: e.message,
                },
            });
        }

        elizaLogger.log(`Finished ${this.name} handler.`);
    }
}

// Register the judge project action
globalContainer.bind(JudgeProjectAction).toSelf();
