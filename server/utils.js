import path from "node:path";
import fs from 'node:fs'
function loadEnv(envPath = ".env") {
    try {
        // Resolve the absolute path to the .env file
        const resolvedPath = path.resolve(process.cwd(), envPath);

        // Check if the file actually exists
        if (!fs.existsSync(resolvedPath)) {
            console.warn(`[Warning]: .env file not found at ${resolvedPath}`);
            return;
        }

        const envConfig = fs.readFileSync(resolvedPath, "utf-8");

        const lines = envConfig.split(/\r?\n/);

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine || trimmedLine.startsWith("#")) {
                continue;
            }

            const delimiterIdx = trimmedLine.indexOf("=");
            if (delimiterIdx === -1) continue; // Skip invalid lines

            const key = trimmedLine.substring(0, delimiterIdx).trim();
            let value = trimmedLine.substring(delimiterIdx + 1).trim();

            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }

            if (process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    } catch (error) {
        console.error("Failed to load .env file:", error);
    }
}

export { loadEnv };
