import type { PluginOptions } from "@elizaos-plugins/plugin-di";
import { SampleProvider } from "./providers/sampleProvider";
import { SampleService } from "./services/sampleService";
import { GetProjectIssuesAction } from "./actions/getProjectIssuesAction";
import { AllocateIssuesAction } from "./actions/allocateIssuesAction";
import { CreatePlanningIssueAction } from "./actions/createPlanningIssueAction";

export const samplePlugin: PluginOptions = {
  name: "sample",
  description: "Enables creation and management of generic resources",
  actions: [
    AllocateIssuesAction,
    GetProjectIssuesAction,
    CreatePlanningIssueAction,
  ],
  providers: [SampleProvider],
  services: [SampleService],
  evaluators: [],
  clients: [],
};

export default samplePlugin;
