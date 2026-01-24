const forecastKey = "7dc94f55d4bd9a5ec62cd6c270202426";
const forecastLat = "20.59";
const forecastLong = "-100.40";
const forecastUnits = "metric";

const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${forecastLat}&lon=${forecastLong}&units=${forecastUnits}&appid=${forecastKey}`;

async function getForecast() {
    try {
        const response = await fetch(forecastURL);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Forecast fetch error:", error);
    }
}

function displayForecast(data) {
    const today = new Date().getDate();
    const dailyHighs = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();

        if (day !== today) {
            if (!dailyHighs[day]) {
                dailyHighs[day] = {
                    name: date.toLocaleDateString("en-US", { weekday: "long" }),
                    high: item.main.temp_max
                };
            } else {
                dailyHighs[day].high = Math.max(dailyHighs[day].high, item.main.temp_max);
            }
        }
    });

    const days = Object.values(dailyHighs).slice(0, 3);

    document.querySelector("#day1-name").textContent = days[0].name;
    document.querySelector("#day1-high").textContent = Math.round(days[0].high);

    document.querySelector("#day2-name").textContent = days[1].name;
    document.querySelector("#day2-high").textContent = Math.round(days[1].high);

    document.querySelector("#day3-name").textContent = days[2].name;
    document.querySelector("#day3-high").textContent = Math.round(days[2].high);
}

getForecast();