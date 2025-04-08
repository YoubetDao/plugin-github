import type { PluginOptions } from '@elizaos-plugins/plugin-di';
import { SampleProvider } from "./providers/sampleProvider";
import { SampleService } from './services/sampleService';
import { GetProjectIssuesAction } from "./actions/getProjectIssuesAction";
import { CreateResourceAction } from './actions/sampleAction';
import { JudgeProjectAction } from './actions/judgeProjectAction';
import { DistributeRewardsAction } from './actions/distributeRewardsAction';
export const samplePlugin: PluginOptions = {
    name: "github",
    description: "Enables get and manage GitHub resources",
    actions: [CreateResourceAction, DistributeRewardsAction, JudgeProjectAction, GetProjectIssuesAction],
    providers: [SampleProvider],
    services: [SampleService],
    evaluators: [],
    clients: [],
};

export default samplePlugin;
