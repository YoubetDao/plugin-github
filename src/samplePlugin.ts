import type { PluginOptions } from "@elizaos-plugins/plugin-di";
import { SampleProvider } from "./providers/sampleProvider";
import { SampleService } from "./services/sampleService";
import { AllocateIssuesAction } from "./actions/allocateIssuesAction";
import { CreatePlanningIssueAction } from "./actions/createPlanningIssueAction";

export const samplePlugin: PluginOptions = {
  name: "sample",
  description: "Enables creation and management of generic resources",
  actions: [
    AllocateIssuesAction,
    CreatePlanningIssueAction,
  ],
  providers: [SampleProvider],
  services: [SampleService],
  evaluators: [],
  clients: [],
};

export default samplePlugin;
