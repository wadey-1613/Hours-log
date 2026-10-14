# Hours Log: working notes

- The app is a single page, `index.html`, published from the `main` branch with GitHub Pages. Data lives on the owner's phone (localStorage), so never change how stored data is read or written without keeping old data working.
- Work on a branch, open a pull request, and test it (headless Chromium with mocked services is fine) before merging.
- **Merging:** the owner has authorised Claude to merge its own pull requests on this repo without asking each time. For a large change (for example a redesign, a new data format, changes to how hours or pay are calculated, or anything that could lose or alter saved data), ask the owner for permission first.
- After merging, tell the owner what changed and that they need to reopen the app with a signal to get it.
