
export const quoteStyleEnum = [
  { value: true, description: "Single quotes" },
  { value: false, description: "Double quotes" }
]

export const importTypeEnum = [
  { value: 0, description: "Top" },
  { value: 1, description: "Buttom" },
  { value: 2, description: "Cursor" }
]

export const javascriptEnum = [
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

export const javascriptXEnum = [
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

export const typescriptEnum = [
  { value: 0, description: "import  from '';" },
  { value: 1, description: "import {  } from '';" },
  { value: 2, description: "import {  as  } from '';" },
  { value: 3, description: "import * as  from '';" },
  { value: 4, description: "import '';" }
];

export const typescriptXEnum = [
  { value: 0, description: "import  from '';" },
  { value: 1, description: "import {  } from '';" },
  { value: 2, description: "import {  as  } from '';" },
  { value: 3, description: "import * as  from '';" },
  { value: 4, description: "import '';" }
];

export const cssEnum = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import url('');" }
];

export const scssSassEnum = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import url('');" },
  { value: 2, description: "@use '';" }
];

export const lessEnum = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import () '';" }
];
