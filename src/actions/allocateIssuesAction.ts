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
export class AllocateIssuesContent {}

/**
 * Options for the AllocateIssues action
 */
const options: ActionOptions<AllocateIssuesContent> = {
  name: "ALLOCATE_ISSUES",
  similes: [
    "ALLOCATE_ISSUES",
    "ASSIGN_TASKS",
    "DISTRIBUTE_TASKS",
    "ASSIGN_ISSUES",
    "分配任务",
  ],
  description:
    "Allocate unassigned GitHub issues to developers by the information you know about the developers. So you don't need to ask me who should do the task.",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Assign unassigned tasks to developers",
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "I've assigned the tasks to developers. Here's the summary:",
        },
      },
    ],
  ],
  contentClass: AllocateIssuesContent,
  suppressInitialMessage: true,
};

/**
 * AllocateIssuesAction
 */
@injectable()
export class AllocateIssuesAction extends BaseInjectableAction<AllocateIssuesContent> {
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
    content: AllocateIssuesContent | null,
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
      const developers = {
        hunknownz: {
          name: "hunknownz",
          email: "hunknownz@gmail.com",
          skills: ["golang", "nodejs"],
        },
        wfnuser: {
          name: "wfnuser",
          email: "wfnuser@gmail.com",
          skills: ["typescript", "react", "nodejs"],
        },
      };
      elizaLogger.info(`Using developers: ${developers}`);

      const github = new Octokit({
        auth: runtime.getSetting("GITHUB_TOKEN"),
      });

      const { data: issues } = await github.rest.issues.listForRepo({
        owner: runtime.getSetting("GITHUB_REPO_OWNER"),
        repo: runtime.getSetting("GITHUB_REPO_REPO"),
        state: "open",
        assignee: "none",
      });

      if (!issues || issues.length === 0) {
        await callback?.({ text: "No unassigned issues found." }, []);
        return;
      }

      const actualIssues = issues.filter((issue) => !issue.pull_request);

      if (actualIssues.length === 0) {
        await callback?.(
          { text: "No unassigned issues found (excluding pull requests)." },
          []
        );
        return;
      }

      elizaLogger.info(
        `Found ${actualIssues.length} unassigned issues (excluding pull requests)`
      );

      // 分配 issues
      const assignments = [];

      for (let i = 0; i < actualIssues.length; i++) {
        const issue = actualIssues[i];
        const developerIndex = i % Object.keys(developers).length;
        const developer = Object.keys(developers)[developerIndex];

        // 分配 issue
        await github.rest.issues.update({
          owner: runtime.getSetting("GITHUB_REPO_OWNER"),
          repo: runtime.getSetting("GITHUB_REPO_REPO"),
          issue_number: issue.number,
          assignees: [developer],
        });

        elizaLogger.info(`Task #${issue.number} assigned to ${developer}`);

        assignments.push({
          issueNumber: issue.number,
          developer: developer,
          issueTitle: issue.title,
        });
      }

      // 生成分配结果的 Markdown 格式摘要
      const assignmentSummary = assignments
        .map(
          (assignment) =>
            `- Issue **#${assignment.issueNumber}** ("${assignment.issueTitle}") has been assigned to [${assignment.developer}](https://github.com/${assignment.developer})`
        )
        .join("\n");

      await callback?.(
        {
          text: `I've assigned the unassigned issues to developers. Here's the summary:\n\n${assignmentSummary}`,
          action: "AllocateIssues",
        },
        []
      );
    } catch (error) {
      console.error(error);
      elizaLogger.error("Error allocating issues:", error);
      await callback?.(
        { text: "An error occurred while allocating issues." },
        []
      );
    }
  }
}

// Register the action with the global container
globalContainer.bind(AllocateIssuesAction).toSelf().inRequestScope();
