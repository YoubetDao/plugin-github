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

export class DistributeRewardsContent {
}

const top3FlowAccountAddresses = [
    "0xe047971d773768ae",
    "0xe047971d773768ae",
    "0xe047971d773768ae",
]

const contributorAddresses = [
    "0xe047971d773768ae",
    "0xe047971d773768ae",
    "0xe047971d773768ae",
]

const distributeRewardsOption: ActionOptions<DistributeRewardsContent> = {
    name: "DISTRIBUTE_REWARDS",
    similes: [
        "DISTRIBUTE_REWARDS",
        "DISTRIBUTE_REWARDS_TO_CONTRIBUTORS",
    ],
    description:
        "call this action to distribute the rewards to the contributors. Caculate the rewards based on the contributions.",
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Distribute the rewards to the contributors",
                    action: "DISTRIBUTE_REWARDS",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Distribute rewards",
                    action: "DISTRIBUTE_REWARDS",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Distribute contributors",
                    action: "DISTRIBUTE_REWARDS",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "Reward contributors",
                    action: "DISTRIBUTE_REWARDS",
                },
            },
        ],
    ],
    contentClass: DistributeRewardsContent,
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
 * Distribute Rewards action
 *
 * @category Actions
 * @description Distribute the rewards to the contributors
 */
@injectable()
export class DistributeRewardsAction extends BaseFlowInjectableAction<DistributeRewardsContent> {
    constructor(
        @inject(AccountsPoolService)
        private readonly acctPoolService: AccountsPoolService,
    ) {
        super(distributeRewardsOption);
    }

    /**
     * Validate the distribute rewards action
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
     * Execute the distribute rewards action
     *
     * @param content the content from processMessages
     * @param callback the callback function to pass the result to Eliza runtime
     * @returns the transaction response
     */
    async execute(
        content: DistributeRewardsContent | null,
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
            let text = `🏆 **Contributor Rewards Distribution** 🏆\n\n`;

            for (let i = 0; i < top3Repos.length; i++) {
                const tokenName = "FLOW";

                // Fetch contributor data for this repo
                const githubUrl = top3Repos[i].htmlUrl;
                const response = await fetch(
                    `${process.env.BACKEND_URL}/v1/github-repos/eval-contributions?repo=${githubUrl}`,
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch contributor data: ${response.statusText}`);
                }

                const result = await response.json();
                if (result.status !== 'success') {
                    throw new Error('Failed to fetch contributor data: API returned non-success status');
                }

                const contributors = result.data.contributors;
                // Calculate rewards for each contributor
                contributors.forEach((contributor) => {
                    const ratio = parseFloat(contributor.ratio) / 100;
                    contributor.reward = amounts[i] * ratio;
                });

                text += `### ${top3Repos[i].name}\n\n`;
                // Distribute rewards to contributors
                for (const contributor of contributors) {
                    const randomAddress = contributorAddresses[Math.floor(Math.random() * contributorAddresses.length)];
                    const resp = await this.acctPoolService.transferFlowToken(
                        userId,
                        randomAddress,
                        contributor.reward,
                    );
                    txIds.push(resp.txId);
                    text += `- Contributor: \`${contributor.login}\`\n`;
                    text += `  - Address: ${randomAddress}\n`;
                    text += `  - Contributions: ${contributor.contributions} commits\n`;
                    text += `  - Reward: ${contributor.reward} ${tokenName}\n`;
                    text += `  - ${formater.formatTransationSent(resp.txId, this.walletSerivce.wallet.network, `Successfully transferred ${contributor.reward} ${tokenName} to ${randomAddress}`)}\n\n`;
                }
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

// Register the distribute rewards action
globalContainer.bind(DistributeRewardsAction).toSelf();
