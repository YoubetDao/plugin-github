import type { PluginOptions } from '@elizaos-plugins/plugin-di';
import { SampleProvider } from "./providers/sampleProvider";
import { SampleService } from './services/sampleService';
import { GetProjectIssuesAction } from "./actions/getProjectIssuesAction";
import { CreateResourceAction } from './actions/sampleAction';
export const samplePlugin: PluginOptions = {
    name: "sample",
    description: "Enables creation and management of generic resources",
    actions: [CreateResourceAction, GetProjectIssuesAction],
    providers: [SampleProvider],
    services: [SampleService],
    evaluators: [],
    clients: [],
};

export default samplePlugin;
