import { z } from "zod";
import { inject, injectable } from "inversify";
import {
    type IAgentRuntime,
    type Memory,
    type HandlerCallback,
    type State,
    elizaLogger,
} from "@elizaos/core";
import {
    property,
    globalContainer,
    BaseInjectableAction,
    type ActionOptions
} from "@elizaos-plugins/plugin-di";

import { SampleService } from "../services/sampleService";
import { SampleProvider } from "../providers/sampleProvider";

/**
 * The content class for the action
 */
export class CreateResourceContent {
    @property({
        description: "Name of the resource",
        schema: z.string(),
    })
    name: string;

    @property({
        description: "Type of resource (document, image, video)",
        schema: z.string(),
    })
    type: string;

    @property({
        description: "Description of the resource",
        schema: z.string(),
    })
    description: string;

    @property({
        description: "Array of tags to categorize the resource",
        schema: z.array(z.string()),
    })
    tags: string[];
}

/**
 * Options for the CreateResource action
 */
const options: ActionOptions<CreateResourceContent> = {
    name: "CREATE_RESOURCE",
    similes: ["CREATE_RESOURCE"],
    description: "Create a new resource with the specified details",
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a new resource with the name 'Resource1' and type 'TypeA'",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: `Resource created successfully:
- Name: Resource1
- Type: TypeA`,
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a new resource with the name 'Resource2' and type 'TypeB'",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: `Resource created successfully:
- Name: Resource2
- Type: TypeB`,
                },
            },
        ],
    ],
    contentClass: CreateResourceContent,
};

/**
 * CreateResourceAction
 */
@injectable()
export class CreateResourceAction extends BaseInjectableAction<CreateResourceContent> {
    constructor(
        @inject(SampleProvider)
        private readonly sampleProvider: SampleProvider,
        @inject(SampleService)
        private readonly sampleService: SampleService
    ) {
        super(options);
    }

    async validate(
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<boolean> {
        return runtime.getSetting("API_KEY") !== undefined;
    }

//     async execute(
//         content: CreateResourceContent | null,
//         runtime: IAgentRuntime,
//         message: Memory,
//         state: State,
//         callback?: HandlerCallback
//     ) {
//         console.log("--------------------------------");
//         console.log("content", content);
//         console.log("--------------------------------");
//         if (!content) {
//             const error = "No content provided for the action.";
//             elizaLogger.warn(error);
//             await callback?.({ text: error }, []);
//             return;
//         }

//         // Call injected provider to do some work
//         try {
//             // Call Service
//             const taskCount = this.sampleService.getGlobalActiveTaskCount();
//             elizaLogger.info("Active task count:", taskCount);

//             // Call Provider
//             const result = await this.sampleProvider.get(runtime, message, state);
//             if (!result) {
//                 elizaLogger.warn("Provider did not return a result.");
//             } else {
//                 elizaLogger.info("Privder result:", result);
//             }
//             // Use result in callback
//         } catch (error) {
//             elizaLogger.error("Provider error:", error);
//         }

//         // persist relevant data if needed to memory/knowledge
//         // const memory = {
//         //     type: "resource",
//         //     content: resourceDetails.object,
//         //     timestamp: new Date().toISOString()
//         // };

//         // await runtime.storeMemory(memory);

//         callback?.(
//             {
//                 text: `Resource created successfully:
// - Name: ${content.name}
// - Type: ${content.type}
// - Description: ${content.description}
// - Tags: ${content.tags.join(", ")}

// Resource has been stored in memory.`,
//             },
//             []
//         );
//     }

async execute(
        content: null,
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        callback?: HandlerCallback
    ) {
        console.log("--------------------------------");
        // if (!content) {
        //     const error = "No content provided for the action.";
        //     elizaLogger.warn(error);
        //     await callback?.({ text: error }, []);
        //     return;
        // }

        try {
            // const github = new Octokit({
            //     auth: runtime.getSetting("GITHUB_TOKEN"),
            // });

            // const { data: issues } = await github.rest.issues.listForRepo({
            //     owner: runtime.getSetting("GITHUB_REPO_OWNER"),
            //     repo: runtime.getSetting("GITHUB_REPO_REPO"),
            //     state: "open",
            //     per_page: 100,
            // });

            // if (!issues || issues.length === 0) {
            //     await callback?.({ text: "No issues found in the repository." }, []);
            //     return;
            // }

            // // Filter out pull requests
            // const actualIssues = issues.filter((issue) => !issue.pull_request);

            // if (actualIssues.length === 0) {
            //     await callback?.({ text: "No issues found (excluding pull requests)." }, []);
            //     return;
            // }

            const actualIssues = [
        {
            "_id": "67d15e3ebe1fbbbba0b3d784",
            "githubId": 2913428192,
            "__v": 0,
            "assignees": [],
            "body": "When accessing the task page without logging in, clicking on **MyTasks** or **MyRewards** redirects to the login page. If you then click the browser's \"Back\" button, the page returns to the task page but immediately jumps back to the login page. Clicking \"Back\" again makes the button unclickable, as if the history has been cleared.\n\nThis issue occurs on both **MyTasks** and **MyRewards**. I've recorded a video to better illustrate the problem.\n\nhttps://github.com/user-attachments/assets/541516f7-0753-44ea-81f7-538977435d3f",
            "closedAt": null,
            "createdAt": "2025-03-12T10:13:16.000Z",
            "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/125",
            "labels": [],
            "project": "66b1e94756f79b17455f9d66",
            "rewardGranted": false,
            "state": "open",
            "title": "[Bug] Repeated Redirection and Navigation Stack Issue on \"Back\" Button Click (Logged Out)",
            "updatedAt": "2025-03-12T10:13:16.000Z",
            "user": {
                "login": "wangeguo",
                "htmlUrl": "https://github.com/wangeguo",
                "avatarUrl": "https://avatars.githubusercontent.com/u/146697?v=4"
            }
        },
        {
            "_id": "67d1b150be1fbbbba0b3f0bd",
            "githubId": 2914469175,
            "__v": 0,
            "assignees": [],
            "body": "支持 opengraph 可以使链接卡片在社交媒体更好展示",
            "closedAt": null,
            "createdAt": "2025-03-12T16:07:43.000Z",
            "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/126",
            "labels": [
                "enhancement"
            ],
            "project": "66b1e94756f79b17455f9d66",
            "rewardGranted": false,
            "state": "open",
            "title": "[Feature] 支持 opengraph",
            "updatedAt": "2025-04-03T04:27:21.000Z",
            "user": {
                "login": "phoouze",
                "htmlUrl": "https://github.com/phoouze",
                "avatarUrl": "https://avatars.githubusercontent.com/u/16130308?v=4"
            }
        },
        {
            "_id": "67d77d7187803b11c420b9fc",
            "githubId": 2923510139,
            "__v": 0,
            "assignees": [],
            "body": "Issue Description\n\n## Unable to trigger rebinding operation\n\nWhen attempting to perform the wallet binding operation, the process fails to trigger as expected.\n\nNote: Previously, I successfully performed this binding operation during the testnet phase, but currently, on mainnet, I’m unable to do so.\n\n## Possible lack of authentication on query API (uncertain if this is an issue)\n  I noticed that the following API endpoint allows querying wallet address information of users other than myself:\n\n   https://according.work/api/youbet/wallet?github={username}\n\nI’m unsure if this behavior is intentional by design or poses a potential privacy risk. ",
            "closedAt": null,
            "createdAt": "2025-03-17T01:39:59.000Z",
            "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/130",
            "labels": [
                "bug"
            ],
            "project": "66b1e94756f79b17455f9d66",
            "rewardGranted": false,
            "state": "open",
            "title": "Wallet rebind and security issue",
            "updatedAt": "2025-04-03T04:26:54.000Z",
            "user": {
                "login": "feynman-x",
                "htmlUrl": "https://github.com/feynman-x",
                "avatarUrl": "https://avatars.githubusercontent.com/u/14007952?v=4"
            }
        },
        {
            "_id": "67d8e89387803b11c4211bb8",
            "githubId": 2926984675,
            "__v": 0,
            "assignees": [],
            "body": "![Image](https://github.com/user-attachments/assets/456a9cc5-7d37-4870-ae65-c03789e36074)",
            "closedAt": null,
            "createdAt": "2025-03-18T03:29:21.000Z",
            "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/133",
            "labels": [],
            "project": "66b1e94756f79b17455f9d66",
            "rewardGranted": false,
            "state": "open",
            "title": "Internal JSON-RPC Error: Execution Reverted due to RedPacket Already Existing",
            "updatedAt": "2025-03-18T03:29:21.000Z",
            "user": {
                "login": "hunknownz",
                "htmlUrl": "https://github.com/hunknownz",
                "avatarUrl": "https://avatars.githubusercontent.com/u/5717967?v=4"
            }
        }];

            // Format tasks
            const formattedIssues = actualIssues.map((issue) => {
                // const priority = issue.labels
                //     .find((label) => label.name.startsWith("priority:"))
                //     .name.replace("priority:", "") || "N/A";

                // const effort = issue.labels
                //     .find((label) => label.name.startsWith("effort:"))
                //     ?.name.replace("effort:", "") || "N/A";

                // const category = issue.labels
                //     .find((label) => !label.name.startsWith("priority:") && !label.name.startsWith("effort:"))
                //     ?.name || "N/A";

                return {
                    title: issue.title,
                    status: issue.state,
                };
            });

            console.log("get issues: ", formattedIssues)
            await callback?.(
                {
                    text: `You are given a plain text list of GitHub issues. Please convert it into a clean, well-formatted Markdown list, where each issue is presented as a bullet point with the following details:
	•	The issue title in bold
	•	Status (open or closed)
	•	Assignee (use unassigned if none)
	•	Creation date (YYYY-MM-DD format)
	•	A clickable link to the issue
    Here is the data: ${JSON.stringify({ issues: formattedIssues })}
    Format each issue as a bullet point like this:
	•	Issue Title — open, assigned to username, created on YYYY-MM-DD. View issue
`,
                },
                []
            );
        } catch (error) {
            console.log(error)
            elizaLogger.error("Error fetching issues:", error);
            await callback?.({ text: "An error occurred while fetching issues." }, []);
        }
    }
}

// Register the action with the global container
globalContainer.bind(CreateResourceAction).toSelf().inRequestScope();
