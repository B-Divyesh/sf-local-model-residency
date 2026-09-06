# Demo sandbox

- URL: `https://local-model-residency.sociobot.in/demo` (local: `http://127.0.0.1:4173/demo`)
- Entry: choose **Try it with sample data** on the first screen.
- Sample: two resident models across Ollama and LM Studio, three runtime checks, and three load or unload events. The LM Studio model deliberately shows GPU memory as Not reported because its supported status response does not provide it.
- Reset: choose **Reset demo** in the persistent banner.
- Leave: choose **Start for real** to reach the desktop download.
- Storage: demo state lives only in JavaScript memory. It does not read or write the real event key (`lmr:residency-events:v1`) or any `demo:` key.
- Network: the demo route does not request release data or call runtime endpoints. All sample data ships in the JavaScript bundle.
