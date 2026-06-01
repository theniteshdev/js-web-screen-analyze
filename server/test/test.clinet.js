// Testing the server in the local

async function testLocal() {
    try {
        const res = await (await fetch("http://localhost:3343/upload-image", {
            "method": "POST",
            "body": "APPLE"
        })).json();
        // const res = (await fetch("http://localhost:3343/upload-image", {
        //     "method": "POST",
        //     "body": "APPLE"
        // }));
        console.log(res);
    } catch (error) {
        console.log("Error while fetching !!")
        process.exit(2);
    }
};

await testLocal();

