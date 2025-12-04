import {
  decryptData,
  decryptDataAsync,
  encryptData,
  encryptDataAsync,
} from "./aes_gcm";

describe("aes_gcm_benchmark_test", () => {
  it("benchmark_encrypt_decrypt", () => {
    const startTime = performance.now();
    const data = "hello world";
    const password = "password";
    for (let i = 0; i < 100; i++) {
      const encrypted = encryptData(data, password);
      const decrypted = decryptData(encrypted, password);
      expect(decrypted).toBe(data);
    }
    const endTime = performance.now();
    console.log(`Sync Encrypt and decrypt time: ${endTime - startTime}ms`);
  });

  it("benchmark_encrypt_decrypt_async", async () => {
    const startTime = performance.now();
    const data = "hello world";
    const password = "password";
    await Promise.all(
      Array.from({ length: 100 }, async () => {
        const encrypted = await encryptDataAsync(data, password);
        const decrypted = await decryptDataAsync(encrypted, password);
        expect(decrypted).toBe(data);
      }),
    );
    const endTime = performance.now();
    console.log(`AsyncEncrypt and decrypt time: ${endTime - startTime}ms`);
  });
});

describe("aes_gcm_virtual_benchmark", () => {
  // warmup for removing JIT compile effect
  beforeAll(async () => {
    const data = "warmup";
    const password = "password";
    for (let i = 0; i < 10; i++) {
      await encryptDataAsync(data, password);
    }
    for (let i = 0; i < 10; i++) {
      encryptData(data, password);
    }
  });

  it("benchmark_sync_sequential", () => {
    const data = "hello world";
    const password = "password";
    const totalOperations = 100;

    const latencies: number[] = [];
    const startTime = performance.now();

    for (let i = 0; i < totalOperations; i++) {
      const opStart = performance.now();
      const encrypted = encryptData(data, password);
      const decrypted = decryptData(encrypted, password);
      const opEnd = performance.now();
      latencies.push(opEnd - opStart);
      expect(decrypted).toBe(data);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    latencies.sort((a, b) => a - b);
    console.log("\n[SYNC] Sequential Benchmark:");
    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(
      `Throughput: ${((totalOperations / totalTime) * 1000).toFixed(2)} ops/sec`,
    );
    console.log(
      `Average latency: ${(latencies.reduce((a, b) => a + b) / latencies.length).toFixed(2)}ms`,
    );
    console.log(
      `P50 latency: ${latencies[Math.floor(latencies.length * 0.5)].toFixed(2)}ms`,
    );
    console.log(
      `P95 latency: ${latencies[Math.floor(latencies.length * 0.95)].toFixed(2)}ms`,
    );
    console.log(
      `P99 latency: ${latencies[Math.floor(latencies.length * 0.99)].toFixed(2)}ms`,
    );
  });

  it("benchmark_async_controlled_concurrency", async () => {
    const data = "hello world";
    const password = "password";
    const totalOperations = 100;
    const concurrency = 10; // 10 concurrent requests

    const latencies: number[] = [];
    const startTime = performance.now();

    for (let i = 0; i < totalOperations; i += concurrency) {
      const batch = Array.from(
        { length: Math.min(concurrency, totalOperations - i) },
        async () => {
          const opStart = performance.now();
          const encrypted = await encryptDataAsync(data, password);
          const decrypted = await decryptDataAsync(encrypted, password);
          const opEnd = performance.now();
          latencies.push(opEnd - opStart);
          expect(decrypted).toBe(data);
        },
      );
      await Promise.all(batch);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    latencies.sort((a, b) => a - b);
    console.log(
      `\n[ASYNC] Controlled Concurrency Benchmark (concurrency=${concurrency}):`,
    );
    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(
      `Throughput: ${((totalOperations / totalTime) * 1000).toFixed(2)} ops/sec`,
    );
    console.log(
      `Average latency: ${(latencies.reduce((a, b) => a + b) / latencies.length).toFixed(2)}ms`,
    );
    console.log(
      `P50 latency: ${latencies[Math.floor(latencies.length * 0.5)].toFixed(2)}ms`,
    );
    console.log(
      `P95 latency: ${latencies[Math.floor(latencies.length * 0.95)].toFixed(2)}ms`,
    );
    console.log(
      `P99 latency: ${latencies[Math.floor(latencies.length * 0.99)].toFixed(2)}ms`,
    );
  });

  it("benchmark_async_gradual_load", async () => {
    const data = "hello world";
    const password = "password";
    const totalOperations = 100;
    const requestsPerSecond = 50; // 50 reqs/sec
    const intervalMs = 1000 / requestsPerSecond;

    const latencies: number[] = [];
    const startTime = performance.now();
    const promises: Promise<void>[] = [];

    for (let i = 0; i < totalOperations; i++) {
      const promise = (async () => {
        const opStart = performance.now();
        const encrypted = await encryptDataAsync(data, password);
        const decrypted = await decryptDataAsync(encrypted, password);
        const opEnd = performance.now();
        latencies.push(opEnd - opStart);
        expect(decrypted).toBe(data);
      })();

      promises.push(promise);

      if (i < totalOperations - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    await Promise.all(promises);
    const endTime = performance.now();

    latencies.sort((a, b) => a - b);
    console.log(`\n[ASYNC] Gradual Load Test (${requestsPerSecond} req/sec):`);
    console.log(`Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(
      `Average latency: ${(latencies.reduce((a, b) => a + b) / latencies.length).toFixed(2)}ms`,
    );
    console.log(
      `P50 latency: ${latencies[Math.floor(latencies.length * 0.5)].toFixed(2)}ms`,
    );
    console.log(
      `P95 latency: ${latencies[Math.floor(latencies.length * 0.95)].toFixed(2)}ms`,
    );
    console.log(
      `P99 latency: ${latencies[Math.floor(latencies.length * 0.99)].toFixed(2)}ms`,
    );
  });

  it("benchmark_sync_gradual_load", async () => {
    const data = "hello world";
    const password = "password";
    const totalOperations = 100;
    const requestsPerSecond = 50; // 50 reqs/sec
    const intervalMs = 1000 / requestsPerSecond;

    const latencies: number[] = [];
    const startTime = performance.now();

    for (let i = 0; i < totalOperations; i++) {
      const opStart = performance.now();
      const encrypted = encryptData(data, password);
      const decrypted = decryptData(encrypted, password);
      const opEnd = performance.now();
      latencies.push(opEnd - opStart);
      expect(decrypted).toBe(data);

      // 다음 요청까지 대기 (실제 트래픽 패턴 시뮬레이션)
      if (i < totalOperations - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    const endTime = performance.now();

    latencies.sort((a, b) => a - b);
    console.log(`\n[SYNC] Gradual Load Test (${requestsPerSecond} req/sec):`);
    console.log(`Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(
      `Average latency: ${(latencies.reduce((a, b) => a + b) / latencies.length).toFixed(2)}ms`,
    );
    console.log(
      `P50 latency: ${latencies[Math.floor(latencies.length * 0.5)].toFixed(2)}ms`,
    );
    console.log(
      `P95 latency: ${latencies[Math.floor(latencies.length * 0.95)].toFixed(2)}ms`,
    );
    console.log(
      `P99 latency: ${latencies[Math.floor(latencies.length * 0.99)].toFixed(2)}ms`,
    );
  });
});

describe("aes_gcm_equivalence_test", () => {
  it("equivalence_encrypt_sync_decrypt_async", async () => {
    const startTime = performance.now();
    const data = "hello world";
    const password = "password";
    const encrypted = encryptData(data, password);
    const decrypted = await decryptDataAsync(encrypted, password);
    expect(decrypted).toBe(data);
    const endTime = performance.now();
    console.log(`Sync Encrypt and decrypt time: ${endTime - startTime}ms`);
  });

  it("equivalence_encrypt_async_decrypt_sync", async () => {
    const startTime = performance.now();
    const data = "hello world";
    const password = "password";
    const encrypted = await encryptDataAsync(data, password);
    const decrypted = decryptData(encrypted, password);
    expect(decrypted).toBe(data);
    const endTime = performance.now();
    console.log(`AsyncEncrypt and decrypt time: ${endTime - startTime}ms`);
  });
});
