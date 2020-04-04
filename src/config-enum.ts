
export const quoteStyle = [
  { value: true, description: "Single quotes" },
  { value: false, description: "Double quotes" }
];

export const importType = [
  { value: 0, description: "Top" },
  { value: 1, description: "Bottom" },
  { value: 2, description: "Cursor" }
];

export const javascript = [
  { value: 0, description: "import  from '';" },
  { value: 1, description: "import {  } from '';" },
  { value: 2, description: "import {  as  } from '';" },
  { value: 3, description: "import {  as value } from '';" },
  { value: 4, description: "import * as  from '';" },
  { value: 5, description: "import * as value from '';" },
  { value: 6, description: "import '';" },
  { value: 7, description: "var  = require('');" },
  { value: 8, description: "export const  = require('');" },
  { value: 9, description: "var value = require('');" },
  { value: 10, description: "export const value = require('');" },
  { value: 11, description: "var  = import('');" },
  { value: 12, description: "export const  = import('');" },
  { value: 13, description: "var value = import('');" },
  { value: 14, description: "export const value = import('');" }
];

export const javascriptX = [
  { value: 0, description: "import  from '';" },
  { value: 1, description: "import {  } from '';" },
  { value: 2, description: "import {  as  } from '';" },
  { value: 3, description: "import {  as value } from '';" },
  { value: 4, description: "import * as  from '';" },
  { value: 5, description: "import * as value from '';" },
  { value: 6, description: "import '';" },
  { value: 7, description: "var  = require('');" },
  { value: 8, description: "export const  = require('');" },
  { value: 9, description: "var value = require('');" },
  { value: 10, description: "export const value = require('');" },
  { value: 11, description: "var  = import('');" },
  { value: 12, description: "export const  = import('');" },
  { value: 13, description: "var value = import('');" },
  { value: 14, description: "export const value = import('');" }
];

export const typescript = [
  { value: 0, description: "import  from '';" },
  { value: 1, description: "import {  } from '';" },
  { value: 2, description: "import {  as  } from '';" },
  { value: 3, description: "import * as  from '';" },
  { value: 4, description: "import '';" }
];

export const typescriptX = [
  { value: 0, description: "import  from '';" },
  { value: 1, description: "import {  } from '';" },
  { value: 2, description: "import {  as  } from '';" },
  { value: 3, description: "import * as  from '';" },
  { value: 4, description: "import '';" }
];

export const css = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import url('');" }
];

export const scssSass = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import url('');" },
  { value: 2, description: "@use '';" }
];

export const less = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import () '';" }
];

export const HTMLScript = [
  { value: 0, description: "<script type=\"text/javascript\" src=\"path\"></script>" }
];

export const HTMLStylesheet = [
  { value: 0, description: "<link href=\"path\" rel=\"stylesheet\">" }
];

export const markdown = [
  { value: 0, description: "![text](path)" }
];

export const markdownImage = [
  { value: 0, description: "![alt-text](path \"Hover text\")" },
  { value: 1, description: "![alt-text][image] / [image]: path \"Hover text\"" }
];
