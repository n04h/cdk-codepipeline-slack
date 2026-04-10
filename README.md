# cdk-codepipeline-slack

[![npm version](https://badge.fury.io/js/@n04h%2Fcdk-codepipeline-slack.svg)](https://badge.fury.io/js/@n04h%2Fcdk-codepipeline-slack)

AWS CodePipeline の承認アクションやパイプライン状態変更を Slack に通知する CDK Construct ライブラリ。

Derivative of [@cloudcomponents/cdk-codepipeline-slack](https://github.com/cloudcomponents/cdk-constructs)

## Install

```console
npm install @n04h/cdk-codepipeline-slack
```

## Prerequisites

- Slack Bot Token (`xoxb-...`)
- Slack Signing Secret
- 通知先の Slack チャンネル名 or チャンネルID

Slack App の作成方法については [Slack API: Building apps](https://api.slack.com/start/building) を参照してください。

## Usage

### SlackApprovalAction

CodePipeline の手動承認ステージに Slack 連携を追加します。承認リクエストが Slack に通知され、Slack 上のボタンから承認/却下ができます。

```typescript
import { SlackApprovalAction } from '@n04h/cdk-codepipeline-slack';

new Pipeline(this, 'Pipeline', {
  stages: [
    // ... source, build stages
    {
      stageName: 'Approve',
      actions: [
        new SlackApprovalAction({
          actionName: 'SlackApproval',
          slackBotToken: 'xoxb-your-bot-token',
          slackSigningSecret: 'your-signing-secret',
          slackChannel: 'deploy-notifications',
          slackBotName: 'DeployBot',
          slackBotIcon: ':rocket:',
          additionalInformation: 'Production deploy approval',
        }),
      ],
    },
  ],
});
```

#### SlackApprovalActionProps

| Prop                    | Type             | Required | Description                                        |
| ----------------------- | ---------------- | -------- | -------------------------------------------------- |
| `actionName`            | `string`         | Yes      | CodePipeline アクション名                          |
| `slackBotToken`         | `string`         | Yes      | Slack Bot Token                                    |
| `slackSigningSecret`    | `string`         | Yes      | Slack Signing Secret                               |
| `slackChannel`          | `string`         | No       | 通知先チャンネル名（`slackChannelId` と排他）      |
| `slackChannelId`        | `string`         | No       | 通知先チャンネルID（`slackChannel` と排他）        |
| `slackChannelTypes`     | `ChannelTypes[]` | No       | チャンネル種別。デフォルト: `[ChannelTypes.PUBLIC]` |
| `slackBotName`          | `string`         | No       | Bot の表示名                                       |
| `slackBotIcon`          | `string`         | No       | Bot のアイコン（emoji）                            |
| `additionalInformation` | `string`         | No       | 承認リクエストの追加情報                           |
| `externalEntityLink`    | `string`         | No       | 承認リクエストに付与する外部リンク                 |

### SlackNotifier

CodePipeline のパイプライン/ステージの状態変更を Slack に通知します。

```typescript
import { SlackNotifier } from '@n04h/cdk-codepipeline-slack';

const pipeline = new Pipeline(this, 'Pipeline', { /* ... */ });

new SlackNotifier(this, 'SlackNotifier', {
  pipeline,
  slackBotToken: 'xoxb-your-bot-token',
  slackSigningSecret: 'your-signing-secret',
  slackChannelId: 'C01234ABCDE',
  slackBotName: 'PipelineBot',
  stageNames: ['Deploy'], // 特定ステージのみ通知（省略で全ステージ）
});
```

#### SlackNotifierProps

| Prop                 | Type             | Required | Description                                        |
| -------------------- | ---------------- | -------- | -------------------------------------------------- |
| `slackBotToken`      | `string`         | Yes      | Slack Bot Token                                    |
| `slackSigningSecret` | `string`         | Yes      | Slack Signing Secret                               |
| `slackChannel`       | `string`         | No       | 通知先チャンネル名（`slackChannelId` と排他）      |
| `slackChannelId`     | `string`         | No       | 通知先チャンネルID（`slackChannel` と排他）        |
| `slackChannelTypes`  | `ChannelTypes[]` | No       | チャンネル種別。デフォルト: `[ChannelTypes.PUBLIC]` |
| `slackBotName`       | `string`         | No       | Bot の表示名                                       |
| `slackBotIcon`       | `string`         | No       | Bot のアイコン（emoji）                            |
| `pipeline`           | `IPipeline`      | Yes      | 通知対象のパイプライン                             |
| `stageNames`         | `string[]`       | No       | 通知対象のステージ名（省略で全ステージ）           |

### ChannelTypes

```typescript
import { ChannelTypes } from '@n04h/cdk-codepipeline-slack';

// パブリックチャンネルのみ（デフォルト）
slackChannelTypes: [ChannelTypes.PUBLIC]

// パブリック + プライベート
slackChannelTypes: [ChannelTypes.PUBLIC, ChannelTypes.PRIVATE]
```

## Architecture

```text
SlackApprovalAction:
  CodePipeline Approval → SNS → Lambda (approval-requester) → Slack 通知
  Slack ボタン操作 → API Gateway → Lambda (approval-handler) → CodePipeline PutApprovalResult

SlackNotifier:
  CodePipeline 状態変更 → EventBridge Rule → Lambda (notifier) → Slack 通知
```

## Development

```console
# ビルド
npm run build

# テスト
npm test

# スナップショット更新
npm run test:updateSnapshot
```

## How to Publish

```console
# バージョン指定
npm version 1.1.0

# alphaバージョンの発行
npm version 1.1.0-alpha.0

# tagをpush
git push origin v1.1.0-alpha.0

# npmレジストリに公開
npm publish --access public
```
