# 💬 Support Guide for Auto Import Relative Path

Thank you for using **Auto Import Relative Path**! This guide outlines how to get help, report issues, and contribute effectively.

---

## 🙋‍♂️ How to Get Help

If you're experiencing problems with the extension or have general questions, please check the following first:

- 🔹 **README & DEMO.md** – For usage instructions, keybindings, and features overview.
- 🔹 **Changelog** – For details about updates and breaking changes.
- 🔹 **GitHub Discussions** – For questions, ideas, or help from the community (coming soon).

---

## 🐞 Reporting a Bug

Found a bug or unexpected behavior?

1. Open an issue on GitHub:  
   👉 [GitHub Issues](https://github.com/ElecTreeFrying/auto-import-relative-path/issues)

2. Please include the following in your report:
   - Extension version (`0.6.0` or later)
   - VS Code version (`^1.98.0` or higher)
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - A screenshot or screen recording if helpful
   - Any relevant logs (check the DevTools console or `console.log()` output)

---

## 🧪 Testing

This extension includes test coverage using:

- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- [Sinon](https://sinonjs.org/)
- [vscode-test](https://github.com/microsoft/vscode-test)

### Run Tests

```bash
npm install
npm run compile-tests
npm test
```

Test cases are organized in the `test/` folder, with coverage for:
- Commands (`copyFilePath`, `pasteImport`, `copyPaste`)
- Utilities (`relativePath`, `fileExtension`, `snippetString`)
- Snippet generation logic per file type

---

## 💡 Feature Requests

Have an idea that could improve productivity? Create a new issue labeled as `enhancement`, or start a discussion if you'd like to brainstorm with others.

---

## 🤝 Contributing

We welcome PRs and contributions! Here's how to get started:

1. Fork the repo
2. Create a feature branch: `git checkout -b my-feature`
3. Write clean, tested code
4. Run tests with `npm test`
5. Submit a pull request with a clear explanation

Make sure your changes follow the existing folder structure:
```
src/
├── commands/
├── constants/
├── import-handlers/
│   ├── markup/
│   ├── scripts/
│   ├── styles/
│   └── utils/
├── model/
├── test/
└── utils/
```

---

## ❤️ Support the Project

If this extension has helped you or saved you time, consider supporting:

- ⭐ Star the repo
- 💬 Leave a review on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import)
- ☕ Buy me a coffee (donation addresses available in `README.md`)

---

Thank you for your support and happy coding!  
— *ElecTreeFrying*
