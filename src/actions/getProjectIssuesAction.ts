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
  type ActionOptions,
} from "@elizaos-plugins/plugin-di";
import { Octokit } from "@octokit/rest";

/**
 * The content class for the action
 */
export class GetProjectIssuesContent {
  // @property({
  //     description: "Owner of the repository",
  //     schema: z.string(),
  // })
  // owner: string;
  // @property({
  //     description: "Name of the repository",
  //     schema: z.string(),
  // })
  // repo: string;
  // @property({
  //     description: "State of issues to fetch (open, closed, or all)",
  //     schema: z.string().default("open"),
  // })
  // state: string;
}

/**
 * Options for the GetProjectIssues action
 */
const options: ActionOptions<GetProjectIssuesContent> = {
  name: "GET_PROJECT_ISSUES",
  similes: [
    "GET_PROJECT_ISSUES",
    "LIST_ISSUES",
    "SHOW_TASKS",
    "GET_ISSUES",
    "LIST_TASKS",
  ],
  description: "Get a list of issues/tasks from a GitHub repository.",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get all issues from the repository",
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Here are the issues in the repository:",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "list tasks from the repository",
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Here are the tasks in the repository:",
        },
      },
    ],
  ],
  contentClass: GetProjectIssuesContent,
  suppressInitialMessage: true,
};

/**
 * GetProjectIssuesAction
 */
@injectable()
export class GetProjectIssuesAction extends BaseInjectableAction<GetProjectIssuesContent> {
  constructor() {
    super(options);
  }

  async validate(
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State
  ): Promise<boolean> {
    return runtime.getSetting("GITHUB_TOKEN") !== undefined;
  }

  async execute(
    content: GetProjectIssuesContent | null,
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    callback?: HandlerCallback
  ) {
    if (!content) {
      const error = "No content provided for the action.";
      elizaLogger.warn(error);
      await callback?.({ text: error }, []);
      return;
    }

    try {
      const github = new Octokit({
        auth: runtime.getSetting("GITHUB_TOKEN"),
      });

      const { data: issues } = await github.rest.issues.listForRepo({
        owner: runtime.getSetting("GITHUB_REPO_OWNER"),
        repo: runtime.getSetting("GITHUB_REPO_REPO"),
        state: "open",
        per_page: 100,
      });

      if (!issues || issues.length === 0) {
        await callback?.({ text: "No issues found in the repository." }, []);
        return;
      }

      const actualIssues = issues.filter((issue) => !issue.pull_request);

      if (actualIssues.length === 0) {
        await callback?.(
          { text: "No issues found (excluding pull requests)." },
          []
        );
        return;
      }

      const formattedTasksMarkdown = actualIssues.map((issue) => {
        return `- [${issue.title}](${issue.html_url}) (${issue.state})`;
      });

      await callback?.(
        {
          text: `Here are the tasks in the repository: \n ${formattedTasksMarkdown.join(
            "\n"
          )}`,
          action: "GetProjectIssues",
        },
        []
      );
    } catch (error) {
      elizaLogger.error("Error fetching issues:", error);
      await callback?.(
        { text: "An error occurred while fetching issues." },
        []
      );
    }
  }
}

// Register the action with the global container
globalContainer.bind(GetProjectIssuesAction).toSelf().inRequestScope();
