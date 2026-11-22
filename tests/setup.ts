import "fake-indexeddb/auto";

(globalThis as unknown as { window: unknown }).window = Object.assign(globalThis, { location: { reload() {} } });
