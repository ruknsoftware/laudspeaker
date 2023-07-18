import FlowBuilderDrawer, {
  FlowBuilderDrawerFixture,
} from "pages/FlowBuilderv2/Drawer/FlowBuilderDrawer";
import FlowEditor, { EdgeType, NodeType } from "pages/FlowBuilderv2/FlowEditor";
import {
  CustomModalIcon,
  EmailIcon,
  ExitIcon,
  JumpToIcon,
  PushIcon,
  SlackIcon,
  SMSIcon,
  TimeDelayIcon,
  TimeWindowIcon,
  UserAttributeIcon,
  WaitUntilIcon,
  WebhookIcon,
} from "pages/FlowBuilderv2/Icons";
import {
  Branch,
  BranchType,
  LogicRelation,
  StatementType,
  TimeType,
} from "pages/FlowBuilderv2/Nodes/NodeData";
import React, { FC, ReactNode, useEffect, useState } from "react";
import {
  ComparisonType,
  deselectNodes,
  refreshFlowBuilder,
  setEdges,
  setIsOnboarding,
  setIsOnboardingWaitUntilTooltipVisible,
  setNodes,
  StatementValueType,
} from "reducers/flow-builder.reducer";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { MessageType, ProviderType } from "types/Workflow";
import Confetti from "./Confetti";
import OnboardingSidePanel from "./OnboardingSidePanel/OnboardingSidePanel";
import OnboardingDialog from "./OnbordingDialog/OnboardingDialog";
import createJourneyColorfulHeaderImage from "./svg/create-journey-colorful-header.svg";
import onboardingCursorImage from "./svg/onboarding-cursor.svg";

export enum OnboardingAction {
  NOTHING = "nothing",
  EMAIL = "email",
}

export interface SandboxStepFixture {
  header?: ReactNode;
  dialog?: {
    position: { top: number; left: number };
    content: ReactNode;
  };
  cursor?: {
    position: {
      top: number;
      left: number;
    };
  };
  tooltip?: {
    position: {
      top: number;
      left: number;
    };
    content: ReactNode;
  };
  checkStepFinished: () => boolean;
}

export enum SandboxStep {
  MESSAGE_AND_STEP,
  DRAG_EMAIL,
  SETTING_PANEL,
  SELECT_TEMPLATE,
  SAVE_SETTINGS,
  TRIGGER,
  MODIFY_TRIGGER,
  CHANGE_TIME,
  SAVE_TRIGGER,
  FINISH,
}

const drawerFixtures: FlowBuilderDrawerFixture[] = [
  {
    groupName: "Messages & Step",
    children: [
      {
        id: OnboardingAction.EMAIL,
        icon: EmailIcon(),
        text: "Email",
        targetId: "emptyLeft",
      },
      {
        id: OnboardingAction.NOTHING,
        icon: SMSIcon(),
        text: "SMS",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: SlackIcon(),
        text: "Slack",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: PushIcon(),
        text: "Push Notification",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: WebhookIcon(),
        text: "Webhook",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: CustomModalIcon(),
        text: "Custom Modal",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: JumpToIcon(),
        text: "Jump To",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: ExitIcon(),
        text: "Exit",
        disabled: true,
      },
    ],
  },
  {
    groupName: "Trigger",
    children: [
      {
        id: OnboardingAction.NOTHING,
        icon: WaitUntilIcon(),
        text: "Wait Until",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: TimeDelayIcon(),
        text: "Time Delay",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: TimeWindowIcon(),
        text: "Time Window",
        disabled: true,
      },
      {
        id: OnboardingAction.NOTHING,
        icon: UserAttributeIcon(),
        text: "User Attribute",
        disabled: true,
      },
    ],
  },
];

interface OnboardingSandboxProps {
  onSandboxComplete: () => void;
}

const OnboardingSandbox: FC<OnboardingSandboxProps> = ({
  onSandboxComplete,
}) => {
  const flowBuilderState = useAppSelector((state) => state.flowBuilder);
  const dispatch = useAppDispatch();

  const emptyLeftNode = flowBuilderState.nodes.find(
    (node) => node.id === "emptyLeft"
  );

  const waitUntilNode = flowBuilderState.nodes.find(
    (node) => node.type === NodeType.WAIT_UNTIL
  );

  const sanboxStepToFixtureMap: Record<SandboxStep, SandboxStepFixture> = {
    [SandboxStep.MESSAGE_AND_STEP]: {
      header: (
        <div className="flex flex-col items-center gap-[20px]">
          <div>
            <img src={createJourneyColorfulHeaderImage} />
          </div>

          <div className="max-w-[830px] text-center">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      dialog: {
        position: { top: 20, left: 256 },
        content: (
          <>
            <div className="font-inter text-[20px] font-medium">
              Message & Step
            </div>
            <p className="text-[#4B5563]">
              <span className="text-[#111827] font-semibold">Message:</span>{" "}
              Send personalized emails, SMS, and Slack to customers.
              <br />
              <span className="text-[#111827] font-semibold">Step:</span> Design
              the journey flow using Loop, Exit, and Conditional steps.
            </p>
          </>
        ),
      },
      checkStepFinished: () => false,
    },
    [SandboxStep.DRAG_EMAIL]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      // cursor: {
      //   position: {
      //     top: 330,
      //     left: 217,
      //   },
      // },
      tooltip: {
        content: (
          <div className="p-[10px] bg-black text-white font-medium">
            Drag an email to the next step
          </div>
        ),
        position: {
          top: 30,
          left: 213,
        },
      },
      checkStepFinished: () =>
        emptyLeftNode?.type === NodeType.MESSAGE &&
        emptyLeftNode.data.type === NodeType.MESSAGE &&
        emptyLeftNode.data.template.type === MessageType.EMAIL,
    },
    [SandboxStep.SETTING_PANEL]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      dialog: {
        content: (
          <>
            <div className="font-inter text-[20px] font-semibold">
              Setting panel
            </div>
            <p className="text-[#4B5563]">
              Using the panel to customize email templates, define step
              conditions, and set triggers to create tailored customer journeys
              with ease.
            </p>
          </>
        ),
        position: { top: 20, left: document.body.clientWidth - 780 },
      },
      checkStepFinished: () => false,
    },
    [SandboxStep.SELECT_TEMPLATE]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      tooltip: {
        content: (
          <div className="p-[10px] bg-black text-white font-medium">
            Select Onboarding template
          </div>
        ),
        position: { top: 200, left: document.body.clientWidth - 300 },
      },
      // cursor: {
      //   position: {
      //     top: 400,
      //     left: document.body.clientWidth - 230,
      //   },
      // },
      checkStepFinished: () =>
        emptyLeftNode?.data.type === NodeType.MESSAGE &&
        emptyLeftNode.data.template.type === MessageType.EMAIL &&
        !!emptyLeftNode.data.template.selected,
    },
    [SandboxStep.SAVE_SETTINGS]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      tooltip: {
        content: (
          <div className="p-[10px] bg-black text-white font-medium">
            Don’t forget to save the setting
          </div>
        ),
        position: {
          top: document.body.clientHeight - 340,
          left: document.body.clientWidth - 320,
        },
      },
      // cursor: {
      //   position: {
      //     top: document.body.clientHeight - 75,
      //     left: document.body.clientWidth - 80,
      //   },
      // },
      checkStepFinished: () => false,
    },
    [SandboxStep.TRIGGER]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      dialog: {
        content: (
          <>
            <div className="font-inter text-[20px] font-semibold">Trigger</div>
            <p className="text-[#4B5563]">
              Initiate flows based on time, user actions, events, or attributes.
            </p>
          </>
        ),
        position: { top: document.body.clientHeight - 420, left: 256 },
      },
      checkStepFinished: () => false,
    },
    [SandboxStep.MODIFY_TRIGGER]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      // cursor: {
      //   position: {
      //     top: 0,
      //     left: 0,
      //   },
      // },
      checkStepFinished: () =>
        flowBuilderState.nodes.find((node) => node.selected)?.type ===
        NodeType.WAIT_UNTIL,
    },
    [SandboxStep.CHANGE_TIME]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      checkStepFinished: () =>
        waitUntilNode?.data.type === NodeType.WAIT_UNTIL &&
        waitUntilNode.data.branches.some(
          (branch) =>
            branch.type === BranchType.MAX_TIME &&
            branch.timeType === TimeType.TIME_DELAY &&
            branch.delay.hours !== 0
        ),
    },
    [SandboxStep.SAVE_TRIGGER]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      tooltip: {
        content: (
          <div className="p-[10px] bg-black text-white font-medium text-center w-[260px]">
            Don't forget to give that Save button some love, okay?
          </div>
        ),
        position: {
          top: document.body.clientHeight - 380,
          left: document.body.clientWidth - 400,
        },
      },
      checkStepFinished: () => false,
    },
    [SandboxStep.FINISH]: {
      header: (
        <div className="flex justify-center py-[20px]">
          <div className="text-center max-w-[830px]">
            Scenario: New users sign up for your platform and receive a
            verification email. Verify within 1 day to receive a welcome email,
            otherwise, get a reminder email.
          </div>
        </div>
      ),
      dialog: {
        content: (
          <>
            <div className="font-inter text-[20px] font-semibold text-center w-full">
              Congratulations on finishing the first Journey!
            </div>
            <p className="text-[#4B5563]">
              You're now ready to take the next step and segment your customers.
            </p>
          </>
        ),
        position: {
          top: document.body.clientHeight / 2 - 196,
          left: document.body.clientWidth / 2 - 174,
        },
      },
      checkStepFinished: () => false,
    },
  };

  const [currentStep, setCurrentStep] = useState(SandboxStep.MESSAGE_AND_STEP);

  const currentSandboxFixture = sanboxStepToFixtureMap[currentStep];

  useEffect(() => {
    dispatch(setIsOnboarding(true));

    const branch1: Branch = {
      id: "brach1",
      type: BranchType.EVENT,
      conditions: [
        {
          name: "Event_name",
          providerType: ProviderType.Custom,
          statements: [
            {
              type: StatementType.PROPERTY,
              key: "Property1_name",
              comparisonType: ComparisonType.EQUALS,
              valueType: StatementValueType.STRING,
              value: "Value",
              relationToNext: LogicRelation.AND,
            },
          ],
          relationToNext: LogicRelation.AND,
        },
      ],
    };

    const branch2: Branch = {
      id: "brach2",
      type: BranchType.MAX_TIME,
      timeType: TimeType.TIME_DELAY,
      delay: { days: 1, hours: 0, minutes: 0 },
    };

    dispatch(
      setEdges([
        {
          id: "start->waitUntil",
          source: "start",
          target: "waitUntil",
          type: EdgeType.PRIMARY,
        },
        {
          id: "waitUntil->emptyLeft",
          source: "waitUntil",
          target: "emptyLeft",
          type: EdgeType.BRANCH,
          data: {
            type: EdgeType.BRANCH,
            branch: branch1,
          },
        },
        {
          id: "waitUntil->emailRight",
          source: "waitUntil",
          target: "emailRight",
          type: EdgeType.BRANCH,
          data: {
            type: EdgeType.BRANCH,
            branch: branch2,
          },
        },
        {
          id: "emailRight->emptyRight",
          source: "emailRight",
          target: "emptyRight",
          type: EdgeType.PRIMARY,
        },
      ])
    );

    dispatch(
      setNodes([
        {
          id: "start",
          type: NodeType.START,
          data: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "waitUntil",
          type: NodeType.WAIT_UNTIL,
          data: {
            type: NodeType.WAIT_UNTIL,
            branches: [branch1, branch2],
          },
          position: { x: 0, y: 0 },
        },
        {
          id: "emptyLeft",
          type: NodeType.EMPTY,
          data: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "emailRight",
          type: NodeType.MESSAGE,
          data: {
            type: NodeType.MESSAGE,
            template: {
              type: MessageType.EMAIL,
              selected: { id: -1, name: "Remind email" },
            },
          },
          position: { x: 0, y: 0 },
        },
        {
          id: "emptyRight",
          type: NodeType.EMPTY,
          data: {},
          position: { x: 0, y: 0 },
        },
      ])
    );

    return () => {
      dispatch(refreshFlowBuilder());
    };
  }, []);

  useEffect(() => {
    if (!currentSandboxFixture.checkStepFinished()) return;

    if (currentStep === SandboxStep.FINISH) return;

    setCurrentStep(currentStep + 1);
  }, [flowBuilderState]);

  useEffect(() => {
    const selectedNode = flowBuilderState.nodes.find((node) => node.selected);
    if (!selectedNode) return;

    if (
      selectedNode.type === NodeType.MESSAGE &&
      [
        SandboxStep.DRAG_EMAIL,
        SandboxStep.SETTING_PANEL,
        SandboxStep.SELECT_TEMPLATE,
        SandboxStep.SAVE_SETTINGS,
      ].includes(currentStep)
    )
      return;

    if (
      selectedNode.type === NodeType.WAIT_UNTIL &&
      [
        SandboxStep.MODIFY_TRIGGER,
        SandboxStep.CHANGE_TIME,
        SandboxStep.SAVE_TRIGGER,
      ].includes(currentStep)
    )
      return;

    dispatch(deselectNodes());
  }, [flowBuilderState, currentStep]);

  useEffect(() => {
    dispatch(
      setIsOnboardingWaitUntilTooltipVisible(
        currentStep === SandboxStep.MODIFY_TRIGGER ||
          currentStep === SandboxStep.CHANGE_TIME
      )
    );
  }, [currentStep]);

  return (
    <>
      {currentSandboxFixture.header}
      <div className="bg-[#F3F4F6] rounded-[25px] h-screen overflow-hidden flex relative ">
        {currentStep === SandboxStep.FINISH && <Confetti />}

        <div className="py-[20px] pl-[20px]">
          <FlowBuilderDrawer fixtures={drawerFixtures} />
        </div>
        <FlowEditor />
        <OnboardingSidePanel
          isSaveDisabled={
            ![SandboxStep.SAVE_SETTINGS, SandboxStep.SAVE_TRIGGER].includes(
              currentStep
            )
          }
          onSaveClick={() => {
            if (currentStep === SandboxStep.FINISH) return;

            setCurrentStep(currentStep + 1);
          }}
        />

        {currentSandboxFixture.cursor && (
          <div
            className="fixed"
            style={{
              top: currentSandboxFixture.cursor.position.top,
              left: currentSandboxFixture.cursor.position.left,
            }}
          >
            <img src={onboardingCursorImage} />
          </div>
        )}
        {currentSandboxFixture.tooltip && (
          <div
            className="absolute"
            style={{
              top: currentSandboxFixture.tooltip.position.top,
              left: currentSandboxFixture.tooltip.position.left,
            }}
          >
            {currentSandboxFixture.tooltip.content}
          </div>
        )}
        {currentSandboxFixture.dialog && (
          <OnboardingDialog
            onNextClick={() => {
              if (currentStep === SandboxStep.FINISH) {
                onSandboxComplete();
                return;
              }

              setCurrentStep(currentStep + 1);
            }}
            position={currentSandboxFixture.dialog.position}
          >
            {currentSandboxFixture.dialog.content}
          </OnboardingDialog>
        )}
      </div>
    </>
  );
};

export default OnboardingSandbox;
