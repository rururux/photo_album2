## Photo Album
写真アルバムアプリ。
プライベートで使うことを想定している為、レスポンシブデザインではなく完全にモバイル向けのデザイン。

対象ブラウザ: 新しめの Android Chromium
(一部 Firefox では動かない API・CSS を使用、Android での使用を想定しているので Safari はよく見てなかった)

### 機能
- [x] Email / OAuth での認証機能
- [x] アルバム・写真データの作成・更新・削除 (CRUD)
- [x] 画像アップロード
- [x] 画像変換 (サイズ変換、avif 変換) (サムネイルのみ)
- [ ] 写真アイテムの並び替え
- [ ] Material Design like なアニメーション
- [ ] PWA 対応

### 構成要素・技術スタック

| 名前 | 説明 | URL |
| ---- | ---- | ---- |
| React | 言わずとしれた UI フレームワーク。 | https://ja.react.dev/ |
| TypeScript | 言わずとしれた言語。 | https://www.typescriptlang.org/ |
| React Router | フルスタック Web アプリを開発できるフレームワーク。 | https://reactrouter.com/ |
| React Hook Form | フォームバリデーションライブラリ。 | https://react-hook-form.com/ |
| better-auth | 認証管理ライブラリ。今回は主に OAuth での認証用に使用。 | https://www.better-auth.com/ |
| drizzle ORM | ORM ライブラリ。今回は Cloudflare D1 と連携させて使用。 | https://orm.drizzle.team/ |
| valibot | 軽量バリデーションライブラリ。 | https://valibot.dev/ |
| Material Design | 普段 Android に馴染んでいるので馴染みのある Material Design を選択。 | https://m3.material.io/ |
| CSS Modules | スタイリングの自由度が高く、特定ライブラリに依存しにくい理由からこちらを選択。 | https://github.com/css-modules/css-modules |
| React Aria / React Aria Components | アクセシビリティに特化したライブラリ。今回はプライベート用ということもあり一部のコンポーネントでのみ使用。 | https://react-spectrum.adobe.com/react-aria/index.html |
| Cloudflare Workers / D1 / R2 / Images | いわば Cloudflare スタック。プライベート用なら無料プランの範囲内で収まるはず。 | https://developers.cloudflare.com/workers/ |


### 技術選定理由
- React Router
  - 使い慣れているというのが大きかった。他の候補は Next.js と Tanstack くらいか。
- React Hook Form
  - conform も候補の1つではあるが、プライベート用ということ、JS をモリモリに使った Web アプリとして作ることを前提としていた為プログレッシブエンハンスメントを考慮しないことを選択したことからこちらを選択。
- better-auth
  - NextAuth.js を事実上吸収するなど、今一番勢いのある認証管理ライブラリであると判断。他の候補としては Remix Auth があるが、better-auth の方が多機能で開発スピードを早められると考えこちらを選択。
- drizzle ORM
  - Prisma より軽く、シンプルで、使い慣れているから。とくに Cloudflare Workers では乗せられるアプリのサイズに制限があることから、軽量であることのアドバンテージは大きい。他の候補は kysely だが、こちらは使い慣れていないので見送った。
- valibot
  - zod より使い慣れていて、RHF や drizzle との連携もできることからこちらを使用。
- CSS Modules
  - まだ Chromium でしか使えないような CSS の新機能も積極的に試していきたかったので、CSS-in-JS のように機能追加や型の対応を待つ必要がないこちらを選択。また、Material Design という既存のデザインシステムを実装できる自由度が欲しかったので Tailwind CSS も見送った。
- React Aria / React Aria Components
  - 主に RangeCalendar コンポーネントと ImageGridList コンポーネントで使用。複雑なカレンダー周りの処理と選択可能なリストアイテムの実装をこのライブラリに任せた。他に Ark UI も候補の1つだったが、そちらでは1つ問題が起きてしまったので見送った。
- Cloudflare スタック
  - 手軽に使い始めやすく、バックエンドの処理を全てこれで完結できるというメリットが大きかった。Supabase はオブジェクトストレージが R2 より小さいのが難点。