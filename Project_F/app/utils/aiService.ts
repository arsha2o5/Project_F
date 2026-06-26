export async function analyzeMeal(meal: String) {
    try {
        const response = await fetch("http://192.168.1.78:5000/aiFoodCalc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                meal: meal,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to analyze meal.");
        }

        const data = await response.json();

        return data;

    } catch (e) {
        console.error(e);
        return null;
    }
}