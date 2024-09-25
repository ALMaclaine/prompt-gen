/* eslint-disable */
export default {
  displayName: "prompt-gen",
  preset: "../../jest.preset.js",
  injectGlobals: true,
  transform: {
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nx/react/plugins/jest",
    "^.+\\.[tj]sx?$": ["babel-jest", { presets: ["@nx/next/babel"] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/apps/prompt-gen",
};
