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
import OpenAI from "openai";

/**
 * The content class for the action
 */
export class CreatePlanningIssueContent {
  @property({
    description: "Project description to be broken down into tasks",
    schema: z.string(),
  })
  description: string;
}

/**
 * Options for the CreatePlanningIssue action
 */
const options: ActionOptions<CreatePlanningIssueContent> = {
  name: "CREATE_PLANNING_ISSUE",
  similes: [
    "CREATE_PLANNING_ISSUE",
    "PLAN_TASKS",
    "CREATE_PROJECT_TASKS",
    "BREAK_DOWN_PROJECT",
  ],
  description:
    "Break down project requirements into GitHub issues using AI assistance.",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Create tasks for this project: Build a user authentication system",
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "I've analyzed the project and created detailed tasks. Here's the issue I've created:",
        },
      },
    ],
  ],
  contentClass: CreatePlanningIssueContent,
  suppressInitialMessage: true,
};

/**
 * CreatePlanningIssueAction
 */
@injectable()
export class CreatePlanningIssueAction extends BaseInjectableAction<CreatePlanningIssueContent> {
  constructor() {
    super(options);
  }

  async validate(
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State
  ): Promise<boolean> {
    return (
      runtime.getSetting("GITHUB_TOKEN") !== undefined &&
      runtime.getSetting("DEEPSEEK_API_KEY") !== undefined
    );
  }

  async execute(
    content: CreatePlanningIssueContent | null,
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
      const prompt = `
      You are a professional project management expert, responsible for breaking down project requirements into clear GitHub issues.
      Based on the project description below, create ONE detailed task. It's just a demo.

      Project Description:
      ${content.description}

      For the task, please provide:
      1. Title (short and clear)
      2. Description (including feature description, acceptance criteria, and technical considerations)
      3. Category (choose one from: bug, feature, documentation, enhancement)
      4. Priority (1-5, with 5 being highest)
      5. Estimated effort (1-10, with 10 being highest)

      Please return in JSON format, like:
      {
        "title": "Implement user login functionality",
        "description": "Create a login form with email and password fields, add validation and error handling.",
        "category": "feature",
        "priority": 5,
        "estimatedEffort": 3
      }

      Return JSON only, without any additional explanation. No \`\`\`json\`\`\`
      `;

      const openai = new OpenAI({
        apiKey: runtime.getSetting("DEEPSEEK_API_KEY"),
        baseURL:
          runtime.getSetting("DEEPSEEK_API_URL") ||
          "https://api.deepseek.com/v1",
      });

      const github = new Octokit({
        auth: runtime.getSetting("GITHUB_TOKEN"),
      });

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: runtime.getSetting("SMALL_DEEPSEEK_MODEL") || "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 500,
      });

      const content_text = completion.choices[0].message.content;
      if (!content_text) {
        throw new Error("No content generated from OpenAI");
      }

      const task = JSON.parse(content_text);

      const issue = await github.rest.issues.create({
        owner: runtime.getSetting("GITHUB_REPO_OWNER"),
        repo: runtime.getSetting("GITHUB_REPO_REPO"),
        title: task.title,
        body: task.description,
        labels: [
          task.category,
          `priority:${task.priority}`,
          `effort:${task.estimatedEffort}`,
        ],
      });

      elizaLogger.info(
        `Created issue successfully: #${issue.data.number} - ${task.title}`
      );

      const response = `I've created some new issues based on your project description:

**#${issue.data.number}**: "${issue.data.title}"
[View issue](${issue.data.html_url})

Category: ${task.category}
Priority: ${task.priority}/5
Estimated Effort: ${task.estimatedEffort}/10`;

      await callback?.(
        {
          text: response,
          action: "CreatePlanningIssue",
        },
        []
      );
    } catch (error) {
      console.error(error);
      elizaLogger.error("Error creating planning issue:", error);
      await callback?.(
        { text: "An error occurred while creating the planning issue." },
        []
      );
    }
  }
}

globalContainer.bind(CreatePlanningIssueAction).toSelf().inRequestScope();
