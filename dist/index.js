var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/actions/sampleAction.ts
import { z } from "zod";
import { inject as inject3, injectable as injectable3 } from "inversify";
import { elizaLogger as elizaLogger3 } from "@elizaos/core";
import { property, globalContainer as globalContainer3, BaseInjectableAction } from "@elizaos-plugins/plugin-di";

// src/services/sampleService.ts
import { inject as inject2, injectable as injectable2 } from "inversify";
import { Service, elizaLogger as elizaLogger2, stringToUuid } from "@elizaos/core";
import { globalContainer as globalContainer2 } from "@elizaos-plugins/plugin-di";

// src/providers/sampleProvider.ts
import { inject, injectable } from "inversify";
import { elizaLogger } from "@elizaos/core";
import { globalContainer } from "@elizaos-plugins/plugin-di";
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
function _ts_param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param, "_ts_param");
globalContainer.bind("DYNAMIC_DATA").toDynamicValue(async () => {
  return Promise.resolve({
    key: "value"
  });
});
var SampleProvider = class {
  static {
    __name(this, "SampleProvider");
  }
  dynamicData;
  _sharedInstance;
  constructor(dynamicData) {
    this.dynamicData = dynamicData;
  }
  // ---- Implementing the InjectableProvider interface ----
  async getInstance(_runtime) {
    if (!this._sharedInstance) {
      this._sharedInstance = {};
    }
    return this._sharedInstance;
  }
  // ---- Implementing the Provider interface ----
  async get(_runtime, _message, _state) {
    elizaLogger.log("Retrieving data in sampleProvider...");
    return `Shared instance data: ${JSON.stringify(this._sharedInstance)}
Dynamic data: ${JSON.stringify(this.dynamicData)}
`;
  }
};
SampleProvider = _ts_decorate([
  injectable(),
  _ts_param(0, inject("DYNAMIC_DATA")),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", [
    typeof Record === "undefined" ? Object : Record
  ])
], SampleProvider);
globalContainer.bind(SampleProvider).toSelf().inSingletonScope();

// src/services/sampleService.ts
function _ts_decorate2(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate2, "_ts_decorate");
function _ts_metadata2(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata2, "_ts_metadata");
function _ts_param2(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param2, "_ts_param");
var SampleService = class _SampleService extends Service {
  static {
    __name(this, "SampleService");
  }
  sampleProvider;
  runtime;
  intervalId;
  DEFAULT_INTERVAL;
  constructor(sampleProvider) {
    super(), this.sampleProvider = sampleProvider, this.runtime = null, this.intervalId = null, this.DEFAULT_INTERVAL = 15 * 60 * 1e3;
  }
  static get serviceType() {
    return "sample";
  }
  static isInitialized = false;
  async initialize(runtime) {
    if (_SampleService.isInitialized) {
      return;
    }
    this.runtime = runtime;
    this.startPeriodicTask();
    _SampleService.isInitialized = true;
    elizaLogger2.info("SampleService initialized and started periodic task");
  }
  // Method to get the number of active tasks
  getGlobalActiveTaskCount() {
    return _SampleService.activeTaskCount;
  }
  static activeTaskCount = 0;
  startPeriodicTask() {
    if (_SampleService.activeTaskCount > 0) {
      elizaLogger2.warn("SampleService: Periodic task already running, skipping");
      return;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    _SampleService.activeTaskCount++;
    elizaLogger2.info(`SampleService: Starting periodic task (active tasks: ${_SampleService.activeTaskCount})`);
    this.fetchSample();
    this.intervalId = setInterval(() => {
      this.fetchSample();
    }, this.DEFAULT_INTERVAL);
  }
  async fetchSample() {
    if (!this.runtime) {
      elizaLogger2.error("SampleService: Runtime not initialized");
      return;
    }
    try {
      const dummyMemory = {
        id: stringToUuid("sample-service-trigger"),
        userId: this.runtime.agentId,
        agentId: this.runtime.agentId,
        roomId: this.runtime.agentId,
        content: {
          text: "Periodic sample fetch"
        },
        createdAt: Date.now()
      };
      const dummyState = {
        userId: this.runtime.agentId,
        bio: "",
        lore: "",
        messageDirections: "",
        postDirections: "",
        roomId: this.runtime.agentId,
        actors: "",
        recentMessages: "",
        recentMessagesData: []
      };
      await this.sampleProvider.get(this.runtime, dummyMemory, dummyState);
      elizaLogger2.info("SampleService: Hello world");
      elizaLogger2.info("SampleService: Successfully fetched and processed sample");
    } catch (error) {
      elizaLogger2.error("SampleService: Error fetching sample:", error);
    }
  }
  // Method to stop the service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      _SampleService.activeTaskCount--;
      elizaLogger2.info(`SampleService stopped (active tasks: ${_SampleService.activeTaskCount})`);
    }
    _SampleService.isInitialized = false;
  }
  // Method to manually trigger a sample fetch (for testing)
  async forceFetch() {
    await this.fetchSample();
  }
};
SampleService = _ts_decorate2([
  injectable2(),
  _ts_param2(0, inject2(SampleProvider)),
  _ts_metadata2("design:type", Function),
  _ts_metadata2("design:paramtypes", [
    typeof SampleProvider === "undefined" ? Object : SampleProvider
  ])
], SampleService);
globalContainer2.bind(SampleService).toSelf().inSingletonScope();

// src/actions/sampleAction.ts
function _ts_decorate3(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate3, "_ts_decorate");
function _ts_metadata3(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata3, "_ts_metadata");
function _ts_param3(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param3, "_ts_param");
var CreateResourceContent = class {
  static {
    __name(this, "CreateResourceContent");
  }
  name;
  type;
  description;
  tags;
};
_ts_decorate3([
  property({
    description: "Name of the resource",
    schema: z.string()
  }),
  _ts_metadata3("design:type", String)
], CreateResourceContent.prototype, "name", void 0);
_ts_decorate3([
  property({
    description: "Type of resource (document, image, video)",
    schema: z.string()
  }),
  _ts_metadata3("design:type", String)
], CreateResourceContent.prototype, "type", void 0);
_ts_decorate3([
  property({
    description: "Description of the resource",
    schema: z.string()
  }),
  _ts_metadata3("design:type", String)
], CreateResourceContent.prototype, "description", void 0);
_ts_decorate3([
  property({
    description: "Array of tags to categorize the resource",
    schema: z.array(z.string())
  }),
  _ts_metadata3("design:type", Array)
], CreateResourceContent.prototype, "tags", void 0);
var options = {
  name: "CREATE_RESOURCE",
  similes: [
    "CREATE_RESOURCE"
  ],
  description: "Create a new resource with the specified details",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Create a new resource with the name 'Resource1' and type 'TypeA'"
        }
      },
      {
        user: "{{agentName}}",
        content: {
          text: `Resource created successfully:
- Name: Resource1
- Type: TypeA`
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Create a new resource with the name 'Resource2' and type 'TypeB'"
        }
      },
      {
        user: "{{agentName}}",
        content: {
          text: `Resource created successfully:
- Name: Resource2
- Type: TypeB`
        }
      }
    ]
  ],
  contentClass: CreateResourceContent
};
var CreateResourceAction = class extends BaseInjectableAction {
  static {
    __name(this, "CreateResourceAction");
  }
  sampleProvider;
  sampleService;
  constructor(sampleProvider, sampleService) {
    super(options), this.sampleProvider = sampleProvider, this.sampleService = sampleService;
  }
  async validate(runtime, _message, _state) {
    return runtime.getSetting("API_KEY") !== void 0;
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
  async execute(content, runtime, _message, _state, callback) {
    console.log("--------------------------------");
    try {
      const actualIssues = [
        {
          "_id": "67d15e3ebe1fbbbba0b3d784",
          "githubId": 2913428192,
          "__v": 0,
          "assignees": [],
          "body": `When accessing the task page without logging in, clicking on **MyTasks** or **MyRewards** redirects to the login page. If you then click the browser's "Back" button, the page returns to the task page but immediately jumps back to the login page. Clicking "Back" again makes the button unclickable, as if the history has been cleared.

This issue occurs on both **MyTasks** and **MyRewards**. I've recorded a video to better illustrate the problem.

https://github.com/user-attachments/assets/541516f7-0753-44ea-81f7-538977435d3f`,
          "closedAt": null,
          "createdAt": "2025-03-12T10:13:16.000Z",
          "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/125",
          "labels": [],
          "project": "66b1e94756f79b17455f9d66",
          "rewardGranted": false,
          "state": "open",
          "title": '[Bug] Repeated Redirection and Navigation Stack Issue on "Back" Button Click (Logged Out)',
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
          "body": "\u652F\u6301 opengraph \u53EF\u4EE5\u4F7F\u94FE\u63A5\u5361\u7247\u5728\u793E\u4EA4\u5A92\u4F53\u66F4\u597D\u5C55\u793A",
          "closedAt": null,
          "createdAt": "2025-03-12T16:07:43.000Z",
          "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/126",
          "labels": [
            "enhancement"
          ],
          "project": "66b1e94756f79b17455f9d66",
          "rewardGranted": false,
          "state": "open",
          "title": "[Feature] \u652F\u6301 opengraph",
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
          "body": "Issue Description\n\n## Unable to trigger rebinding operation\n\nWhen attempting to perform the wallet binding operation, the process fails to trigger as expected.\n\nNote: Previously, I successfully performed this binding operation during the testnet phase, but currently, on mainnet, I\u2019m unable to do so.\n\n## Possible lack of authentication on query API (uncertain if this is an issue)\n  I noticed that the following API endpoint allows querying wallet address information of users other than myself:\n\n   https://according.work/api/youbet/wallet?github={username}\n\nI\u2019m unsure if this behavior is intentional by design or poses a potential privacy risk. ",
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
        }
      ];
      const formattedIssues = actualIssues.map((issue) => {
        return {
          title: issue.title,
          status: issue.state
        };
      });
      console.log("get issues: ", formattedIssues);
      await callback?.({
        text: `You are given a plain text list of GitHub issues. Please convert it into a clean, well-formatted Markdown list, where each issue is presented as a bullet point with the following details:
	\u2022	The issue title in bold
	\u2022	Status (open or closed)
	\u2022	Assignee (use unassigned if none)
	\u2022	Creation date (YYYY-MM-DD format)
	\u2022	A clickable link to the issue
    Here is the data: ${JSON.stringify({
          issues: formattedIssues
        })}
    Format each issue as a bullet point like this:
	\u2022	Issue Title \u2014 open, assigned to username, created on YYYY-MM-DD. View issue
`
      }, []);
    } catch (error) {
      console.log(error);
      elizaLogger3.error("Error fetching issues:", error);
      await callback?.({
        text: "An error occurred while fetching issues."
      }, []);
    }
  }
};
CreateResourceAction = _ts_decorate3([
  injectable3(),
  _ts_param3(0, inject3(SampleProvider)),
  _ts_param3(1, inject3(SampleService)),
  _ts_metadata3("design:type", Function),
  _ts_metadata3("design:paramtypes", [
    typeof SampleProvider === "undefined" ? Object : SampleProvider,
    typeof SampleService === "undefined" ? Object : SampleService
  ])
], CreateResourceAction);
globalContainer3.bind(CreateResourceAction).toSelf().inRequestScope();

// src/actions/sampleFlowAction.ts
import { z as z2 } from "zod";
import { injectable as injectable4 } from "inversify";
import { elizaLogger as elizaLogger4 } from "@elizaos/core";
import { globalContainer as globalContainer4, property as property2 } from "@elizaos-plugins/plugin-di";
import { BaseFlowInjectableAction, scripts as defaultFlowScripts } from "@elizaos-plugins/plugin-flow";
function _ts_decorate4(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate4, "_ts_decorate");
function _ts_metadata4(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata4, "_ts_metadata");
var ActionContentDef = class {
  static {
    __name(this, "ActionContentDef");
  }
  vm;
};
_ts_decorate4([
  property2({
    description: "This field should be Cadence or EVM",
    examples: [
      "If use mentioned Flow native token or smart contract, the field should be Cadence",
      "Otherwise, the field should be EVM"
    ],
    schema: z2.string()
  }),
  _ts_metadata4("design:type", String)
], ActionContentDef.prototype, "vm", void 0);
var actionOpts = {
  name: "CREATE_RESOURCE_FOR_FLOW",
  similes: [],
  description: "Create a new resource with the specified details",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Create a new resource on Flow Cadence with the following details",
          action: "CREATE_RESOURCE_FOR_FLOW"
        }
      }
    ]
  ],
  contentClass: ActionContentDef,
  suppressInitialMessage: false
};
var SampleFlowAction = class extends BaseFlowInjectableAction {
  static {
    __name(this, "SampleFlowAction");
  }
  constructor() {
    super(actionOpts);
  }
  /**
   * Validate if the action can be executed
   */
  async validate(_runtime, message, _state) {
    const keywords = [
      "resource",
      "\u8D44\u6E90"
    ];
    return keywords.some((keyword) => message.content.text.toLowerCase().includes(keyword.toLowerCase()));
  }
  /**
   * Execute the action
   *
   * @param content the content from processMessages
   * @param callback the callback function to pass the result to Eliza runtime
   * @returns the transaction response
   */
  async execute(content, runtime, _message, _state, callback) {
    if (!content) {
      elizaLogger4.warn("No content generated");
      return;
    }
    elizaLogger4.log(`Starting ${this.name} handler...`);
    const resp = {
      ok: false
    };
    const agentWalletAddress = runtime.getSetting("FLOW_ADDRESS");
    let data;
    try {
      data = await this.walletSerivce.executeScript(defaultFlowScripts.mainGetAccountInfo, (arg, t) => [
        arg(agentWalletAddress, t.Address)
      ], "");
    } catch (err) {
      resp.error = err.message;
    }
    if (data) {
      resp.ok = true;
      resp.data = JSON.stringify(data);
    } else {
      resp.error = resp.error ?? "Unknown error";
    }
    if (!resp.ok) {
      elizaLogger4.error("Error:", resp.error);
      callback?.({
        text: `Unable to load balance of wallet ${agentWalletAddress}`,
        content: {
          error: resp.error ?? "Unknown error"
        },
        source: "FlowBlockchain"
      });
    }
    callback?.({
      text: `Resource created successfully at VM: ${content.vm}`,
      source: "FlowBlockchain"
    });
    elizaLogger4.log(`Finished ${this.name} handler.`);
  }
};
SampleFlowAction = _ts_decorate4([
  injectable4(),
  _ts_metadata4("design:type", Function),
  _ts_metadata4("design:paramtypes", [])
], SampleFlowAction);
globalContainer4.bind(SampleFlowAction).toSelf().inRequestScope();

// src/actions/getProjectIssuesAction.ts
import { injectable as injectable5 } from "inversify";
import { elizaLogger as elizaLogger5 } from "@elizaos/core";
import { globalContainer as globalContainer5, BaseInjectableAction as BaseInjectableAction2 } from "@elizaos-plugins/plugin-di";
function _ts_decorate5(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate5, "_ts_decorate");
function _ts_metadata5(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata5, "_ts_metadata");
var GetProjectIssuesContent = class {
  static {
    __name(this, "GetProjectIssuesContent");
  }
};
var options2 = {
  name: "GET_PROJECT_ISSUES",
  similes: [
    "GET_PROJECT_ISSUES",
    "LIST_ISSUES",
    "SHOW_TASKS",
    "GET_ISSUES",
    "LIST_TASKS"
  ],
  description: "Get a list of issues/tasks from a GitHub repository",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get all issues from the repository"
        }
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Here are the issues in the repository:"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "list tasks from the repository"
        }
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Here are the tasks in the repository:"
        }
      }
    ]
  ],
  contentClass: GetProjectIssuesContent
};
var GetProjectIssuesAction = class extends BaseInjectableAction2 {
  static {
    __name(this, "GetProjectIssuesAction");
  }
  constructor() {
    super(options2);
  }
  async validate(runtime, _message, _state) {
    return runtime.getSetting("GITHUB_TOKEN") !== void 0;
  }
  async execute(content, runtime, _message, _state, callback) {
    console.log("--------------------------------");
    if (!content) {
      const error = "No content provided for the action.";
      elizaLogger5.warn(error);
      await callback?.({
        text: error
      }, []);
      return;
    }
    try {
      const actualIssues = [
        {
          "_id": "67d15e3ebe1fbbbba0b3d784",
          "githubId": 2913428192,
          "__v": 0,
          "assignees": [],
          "body": `When accessing the task page without logging in, clicking on **MyTasks** or **MyRewards** redirects to the login page. If you then click the browser's "Back" button, the page returns to the task page but immediately jumps back to the login page. Clicking "Back" again makes the button unclickable, as if the history has been cleared.

This issue occurs on both **MyTasks** and **MyRewards**. I've recorded a video to better illustrate the problem.

https://github.com/user-attachments/assets/541516f7-0753-44ea-81f7-538977435d3f`,
          "closedAt": null,
          "createdAt": "2025-03-12T10:13:16.000Z",
          "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/125",
          "labels": [],
          "project": "66b1e94756f79b17455f9d66",
          "rewardGranted": false,
          "state": "open",
          "title": '[Bug] Repeated Redirection and Navigation Stack Issue on "Back" Button Click (Logged Out)',
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
          "body": "\u652F\u6301 opengraph \u53EF\u4EE5\u4F7F\u94FE\u63A5\u5361\u7247\u5728\u793E\u4EA4\u5A92\u4F53\u66F4\u597D\u5C55\u793A",
          "closedAt": null,
          "createdAt": "2025-03-12T16:07:43.000Z",
          "htmlUrl": "https://github.com/YoubetDao/youbet-task/issues/126",
          "labels": [
            "enhancement"
          ],
          "project": "66b1e94756f79b17455f9d66",
          "rewardGranted": false,
          "state": "open",
          "title": "[Feature] \u652F\u6301 opengraph",
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
          "body": "Issue Description\n\n## Unable to trigger rebinding operation\n\nWhen attempting to perform the wallet binding operation, the process fails to trigger as expected.\n\nNote: Previously, I successfully performed this binding operation during the testnet phase, but currently, on mainnet, I\u2019m unable to do so.\n\n## Possible lack of authentication on query API (uncertain if this is an issue)\n  I noticed that the following API endpoint allows querying wallet address information of users other than myself:\n\n   https://according.work/api/youbet/wallet?github={username}\n\nI\u2019m unsure if this behavior is intentional by design or poses a potential privacy risk. ",
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
        }
      ];
      const formattedIssues = actualIssues.map((issue) => {
        return {
          title: issue.title,
          status: issue.state
        };
      });
      console.log("get issues: ", formattedIssues);
      await callback?.({
        text: `You are given a plain text list of GitHub issues. Please convert it into a clean, well-formatted Markdown list, where each issue is presented as a bullet point with the following details:
	\u2022	The issue title in bold
	\u2022	Status (open or closed)
	\u2022	Assignee (use unassigned if none)
	\u2022	Creation date (YYYY-MM-DD format)
	\u2022	A clickable link to the issue
    Here is the data: ${JSON.stringify({
          issues: formattedIssues
        })}
    Format each issue as a bullet point like this:
	\u2022	Issue Title \u2014 open, assigned to username, created on YYYY-MM-DD. View issue
`
      }, []);
    } catch (error) {
      console.log(error);
      elizaLogger5.error("Error fetching issues:", error);
      await callback?.({
        text: "An error occurred while fetching issues."
      }, []);
    }
  }
};
GetProjectIssuesAction = _ts_decorate5([
  injectable5(),
  _ts_metadata5("design:type", Function),
  _ts_metadata5("design:paramtypes", [])
], GetProjectIssuesAction);
globalContainer5.bind(GetProjectIssuesAction).toSelf().inRequestScope();

// src/samplePlugin.ts
var samplePlugin = {
  name: "sample",
  description: "Enables creation and management of generic resources",
  actions: [
    CreateResourceAction,
    GetProjectIssuesAction
  ],
  providers: [
    SampleProvider
  ],
  services: [
    SampleService
  ],
  evaluators: [],
  clients: []
};

// src/sampleFlowPlugin.ts
import { FlowWalletService } from "@elizaos-plugins/plugin-flow";
var sampleFlowPlugin = {
  name: "sample",
  description: "Enables creation and management of generic resources",
  actions: [
    CreateResourceAction,
    SampleFlowAction
  ],
  providers: [
    SampleProvider
  ],
  services: [
    SampleService,
    FlowWalletService
  ],
  evaluators: [],
  clients: []
};

// src/index.ts
var index_default = samplePlugin;
export {
  ActionContentDef,
  CreateResourceAction,
  CreateResourceContent,
  SampleFlowAction,
  SampleProvider,
  SampleService,
  index_default as default,
  sampleFlowPlugin,
  samplePlugin
};
//# sourceMappingURL=index.js.map