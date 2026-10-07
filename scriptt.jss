/* =========================================================
   BOARDSY
   PCB INTEGRITY INSPECTION SYSTEM
   scriptt.js
   ========================================================= */


/* =========================================================
   1. ELEMENT REFERENCES
   ========================================================= */

const clockElement = document.getElementById("clock");
const cameraTimeElement = document.getElementById("cameraTime");

const currentValue = document.getElementById("currentValue");
const voltageValue = document.getElementById("voltageValue");
const resistanceValue = document.getElementById("resistanceValue");
const ad620Value = document.getElementById("ad620Value");

const pcbStatus = document.getElementById("pcbStatus");
const pcbStatusDescription =
    document.getElementById("pcbStatusDescription");

const crackProbability =
    document.getElementById("crackProbability");

const probabilityText =
    document.getElementById("probabilityText");

const probabilityFill =
    document.getElementById("probabilityFill");

const probabilityDescription =
    document.getElementById("probabilityDescription");

const inspectionTime =
    document.getElementById("inspectionTime");

const inspectionTimeDescription =
    document.getElementById("inspectionTimeDescription");

const totalInspections =
    document.getElementById("totalInspections");

const passedInspections =
    document.getElementById("passedInspections");

const failedInspections =
    document.getElementById("failedInspections");

const passRate =
    document.getElementById("passRate");

const historyRows =
    document.getElementById("historyRows");

const historyCount =
    document.getElementById("historyCount");

const deviceValue =
    document.getElementById("deviceValue");

const cameraStatus =
    document.getElementById("cameraStatus");

const sensorStatus =
    document.getElementById("sensorStatus");

const analysisStatus =
    document.getElementById("analysisStatus");

const systemStatus =
    document.getElementById("systemStatus");

const systemStatusText =
    document.getElementById("systemStatusText");

const cameraLiveText =
    document.getElementById("cameraLiveText");

const cameraResolution =
    document.getElementById("cameraResolution");

const cameraFps =
    document.getElementById("cameraFps");

const cameraVisionStatus =
    document.getElementById("cameraVisionStatus");

const cameraFooterStatus =
    document.getElementById("cameraFooterStatus");

const cameraStreamStatus =
    document.getElementById("cameraStreamStatus");

const cameraFooterDot =
    document.getElementById("cameraFooterDot");

const sensorLiveStatus =
    document.getElementById("sensorLiveStatus");

const signalIndicator =
    document.getElementById("signalIndicator");

const signalValue =
    document.getElementById("signalValue");

const analysisEngine =
    document.getElementById("analysisEngine");

const analysisDot =
    document.getElementById("analysisDot");

const analysisFooterText =
    document.getElementById("analysisFooterText");

const analysisCompleteText =
    document.getElementById("analysisCompleteText");

const inspectionControlStatus =
    document.getElementById("inspectionControlStatus");

const inspectionMode =
    document.getElementById("inspectionMode");

const inspectButton =
    document.getElementById("inspectButton");

const inspectionProgress =
    document.getElementById("inspectionProgress");

const dsaStatus =
    document.getElementById("dsaStatus");

const thresholdValue =
    document.getElementById("thresholdValue");

const readingCount =
    document.getElementById("readingCount");

const abnormalReadings =
    document.getElementById("abnormalReadings");

const dsaDecision =
    document.getElementById("dsaDecision");

const simulatedPcb =
    document.getElementById("simulatedPcb");

const cameraStream =
    document.getElementById("cameraStream");

const cameraPanel =
    document.querySelector(".camera-panel");

const cameraScreen =
    document.querySelector(".camera-screen");

const activityBars =
    document.querySelectorAll(
        "#activityBars span"
    );

const footerYear =
    document.getElementById("footerYear");


/* =========================================================
   2. BOARDSY CONFIGURATION
   ========================================================= */

const CONFIG = {

    /*
     * Frontend talks ONLY to the C++ backend.
     *
     * The backend decides whether the source is:
     * DEMO / SIMULATION
     * or
     * ESP32 / HARDWARE
     */

    API_BASE: "",

    DEVICE_ID: "BOARDSY-01",

    sensorUpdateInterval: 1500,

    statisticsUpdateInterval: 5000,

    historyUpdateInterval: 5000,

    cameraUpdateInterval: 1000,

    requestTimeout: 5000,

    historyLimit: 4

};


/* =========================================================
   3. INTERNAL STATE
   ========================================================= */

const state = {

    connected: false,

    inspectionRunning: false,

    sensor: {

        current_mA: null,

        voltage_V: null,

        resistance_ohms: null,

        timestamp: null,

        source: "UNKNOWN"

    },

    analysis: {

        probability: null,

        inspectionTime: null,

        status: "READY",

        source: "UNKNOWN"

    },

    dsa: {

        threshold: null,

        readingCount: null,

        abnormalReadings: null,

        decision: "WAITING"

    },

    camera: {

        connected: false,

        source: "UNKNOWN",

        resolution: "--",

        fps: "--",

        signal: "WAITING"

    },

    statistics: {

        total: 0,

        passed: 0,

        failed: 0,

        passRate: 0

    }

};


/* =========================================================
   4. GENERIC API REQUEST
   ========================================================= */

async function apiRequest(

    endpoint,

    options = {}

) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(

            () => controller.abort(),

            CONFIG.requestTimeout

        );


    try {

        const response =
            await fetch(

                CONFIG.API_BASE + endpoint,

                {

                    ...options,

                    cache: "no-store",

                    signal: controller.signal,

                    headers: {

                        "Accept":
                            "application/json",

                        ...(options.body
                            ? {
                                "Content-Type":
                                    "application/json"
                            }
                            : {}),

                        ...(options.headers || {})

                    }

                }

            );


        let data = null;

        const contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();

            data = text
                ? { message: text }
                : null;

        }


        if (!response.ok) {

            const message =
                data &&
                (
                    data.error ||
                    data.message
                )
                    ? (
                        data.error ||
                        data.message
                    )
                    : `HTTP ${response.status}`;

            throw new Error(message);

        }


        return data;

    } finally {

        clearTimeout(timeout);

    }

}


/* =========================================================
   5. LIVE CLOCK
   ========================================================= */

function updateClock() {

    const now =
        new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    const timeString =
        `${hours}:${minutes}:${seconds}`;


    if (clockElement) {

        clockElement.textContent =
            timeString;

    }


    if (cameraTimeElement) {

        cameraTimeElement.textContent =
            timeString;

    }

}


updateClock();

setInterval(
    updateClock,
    1000
);


/* =========================================================
   6. GENERAL UI HELPERS
   ========================================================= */

function formatNumber(
    value,
    decimals = 2
) {

    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(
            Number(value)
        )
    ) {

        return "--";

    }

    return Number(value).toFixed(
        decimals
    );

}


function formatTime(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "--";

    }


    const numeric =
        Number(value);


    if (
        !Number.isFinite(numeric)
    ) {

        return "--";

    }


    /*
     * Backend may provide milliseconds
     * or seconds.
     */

    if (numeric > 100) {

        return (
            numeric / 1000
        ).toFixed(2);

    }


    return numeric.toFixed(2);

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   7. CONNECTION STATUS
   ========================================================= */

function setSystemConnection(
    connected
) {

    state.connected =
        connected;


    if (systemStatus) {

        systemStatus.classList.toggle(
            "online",
            connected
        );

        systemStatus.classList.toggle(
            "offline",
            !connected
        );

    }


    if (systemStatusText) {

        systemStatusText.textContent =
            connected
                ? "SYSTEM ONLINE"
                : "BACKEND OFFLINE";

    }

}


/* =========================================================
   8. SENSOR DISPLAY
   ========================================================= */

function animateSensorValue(
    element
) {

    if (!element) {

        return;

    }


    element.classList.remove(
        "updated"
    );


    void element.offsetWidth;


    element.classList.add(
        "updated"
    );


    setTimeout(

        () => {

            element.classList.remove(
                "updated"
            );

        },

        500

    );

}


function updateSensorDisplay() {

    const sensor =
        state.sensor;


    if (currentValue) {

        currentValue.textContent =
            formatNumber(
                sensor.current_mA,
                1
            );

        animateSensorValue(
            currentValue
        );

    }


    if (voltageValue) {

        voltageValue.textContent =
            formatNumber(
                sensor.voltage_V,
                2
            );

        animateSensorValue(
            voltageValue
        );

    }


    if (resistanceValue) {

        resistanceValue.textContent =
            formatNumber(
                sensor.resistance_ohms,
                1
            );

        animateSensorValue(
            resistanceValue
        );

    }


    /*
     * AD620 is not automatically treated
     * as resistance or system voltage.
     *
     * Only display it if backend supplies it.
     */

    if (ad620Value) {

        if (
            Number.isFinite(
                Number(
                    sensor.ad620_V
                )
            )
        ) {

            ad620Value.textContent =
                formatNumber(
                    sensor.ad620_V,
                    3
                );

        } else {

            ad620Value.textContent =
                "--";

        }

    }


    const source =
        sensor.source || "UNKNOWN";


    if (sensorLiveStatus) {

        sensorLiveStatus.textContent =
            source === "SIMULATION"
                ? "● DEMO"
                : "● LIVE";

    }


    if (sensorStatus) {

        sensorStatus.textContent =
            source === "SIMULATION"
                ? "SIMULATION"
                : "ACTIVE";

    }


    if (signalValue) {

        signalValue.textContent =
            sensor.current_mA !== null &&
            sensor.voltage_V !== null
                ? "STABLE"
                : "WAITING";

    }


    if (signalIndicator) {

        signalIndicator.classList.toggle(

            "offline",

            sensor.current_mA === null

        );

    }


    updateActivityBars();

}


/* =========================================================
   9. SENSOR ACTIVITY
   ========================================================= */

function updateActivityBars() {

    if (!activityBars.length) {

        return;

    }


    activityBars.forEach(

        (bar, index) => {

            const active =
                Math.random() >
                0.25;

            bar.style.height =
                active
                    ? `${30 + Math.random() * 70}%`
                    : "18%";

        }

    );

}


/* =========================================================
   10. GET LIVE SENSOR DATA
   ========================================================= */

async function loadSensorData() {

    try {

        const data =
            await apiRequest(
                "/api/data"
            );


        if (!data) {

            return;

        }


        /*
         * Support the current backend naming.
         */

        state.sensor.current_mA =
            Number.isFinite(
                Number(
                    data.current_mA
                )
            )
                ? Number(
                    data.current_mA
                )
                : Number.isFinite(
                    Number(
                        data.current
                    )
                )
                    ? Number(
                        data.current
                    )
                    : null;


        state.sensor.voltage_V =
            Number.isFinite(
                Number(
                    data.voltage_V
                )
            )
                ? Number(
                    data.voltage_V
                )
                : Number.isFinite(
                    Number(
                        data.voltage
                    )
                )
                    ? Number(
                        data.voltage
                    )
                    : null;


        /*
         * Resistance MUST come from the backend.
         * We do not generate or independently calculate
         * a replacement value in the browser.
         */

        state.sensor.resistance_ohms =
            Number.isFinite(
                Number(
                    data.resistance_ohms
                )
            )
                ? Number(
                    data.resistance_ohms
                )
                : Number.isFinite(
                    Number(
                        data.resistance
                    )
                )
                    ? Number(
                        data.resistance
                    )
                    : null;


        state.sensor.ad620_V =
            Number.isFinite(
                Number(
                    data.ad620_V
                )
            )
                ? Number(
                    data.ad620_V
                )
                : null;


        state.sensor.timestamp =
            data.timestamp ||
            data.time ||
            null;


        state.sensor.source =
            data.source ||
            data.sensor_source ||
            "UNKNOWN";


        updateSensorDisplay();

        setSystemConnection(
            true
        );


    } catch (error) {

        console.warn(
            "Sensor API unavailable:",
            error.message
        );


        if (sensorStatus) {

            sensorStatus.textContent =
                "OFFLINE";

        }


        if (sensorLiveStatus) {

            sensorLiveStatus.textContent =
                "● OFFLINE";

        }


        if (signalValue) {

            signalValue.textContent =
                "NO DATA";

        }


        setSystemConnection(
            false
        );

    }

}


/* =========================================================
   11. ANALYSIS DISPLAY
   ========================================================= */

function updateAnalysisDisplay() {

    const probability =
        state.analysis.probability;

    const status =
        String(
            state.analysis.status ||
            "READY"
        ).toUpperCase();


    if (crackProbability) {

        crackProbability.textContent =
            probability === null
                ? "--"
                : formatNumber(
                    probability,
                    1
                );

    }


    if (probabilityText) {

        probabilityText.textContent =
            probability === null
                ? "--"
                : `${formatNumber(
                    probability,
                    1
                )}%`;

    }


    if (probabilityFill) {

        const width =
            probability === null
                ? 0
                : Math.min(
                    Math.max(
                        Number(
                            probability
                        ),
                        0
                    ),
                    100
                );

        probabilityFill.style.width =
            `${width}%`;

    }


    if (inspectionTime) {

        inspectionTime.textContent =
            state.analysis.inspectionTime === null
                ? "--"
                : formatTime(
                    state.analysis.inspectionTime
                );

    }


    if (pcbStatus) {

        pcbStatus.textContent =
            status;


        pcbStatus.classList.remove(
            "pass-status",
            "fail-status"
        );


        if (status === "PASS") {

            pcbStatus.classList.add(
                "pass-status"
            );

        } else if (
            status === "FAIL" ||
            status === "CRACK DETECTED"
        ) {

            pcbStatus.classList.add(
                "fail-status"
            );

        }

    }


    if (pcbStatusDescription) {

        if (status === "PASS") {

            pcbStatusDescription.textContent =
                "NO CRITICAL DEFECT DETECTED";

        } else if (
            status === "FAIL" ||
            status === "CRACK DETECTED"
        ) {

            pcbStatusDescription.textContent =
                "ABNORMAL CONDITION DETECTED";

        } else if (
            state.inspectionRunning
        ) {

            pcbStatusDescription.textContent =
                "INSPECTION IN PROGRESS";

        } else {

            pcbStatusDescription.textContent =
                "AWAITING INSPECTION";

        }

    }


    if (probabilityDescription) {

        if (probability === null) {

            probabilityDescription.textContent =
                "NO ANALYSIS YET";

        } else if (
            Number(probability) < 10
        ) {

            probabilityDescription.textContent =
                "LOW DEFECT RISK";

        } else {

            probabilityDescription.textContent =
                "ELEVATED DEFECT RISK";

        }

    }


    if (inspectionTimeDescription) {

        inspectionTimeDescription.textContent =
            state.analysis.inspectionTime === null
                ? "WAITING FOR INSPECTION"
                : "PROCESSING COMPLETE";

    }


    if (analysisEngine) {

        analysisEngine.textContent =
            state.analysis.source ===
                "SIMULATION"
                ? "DEMO ANALYSIS ENGINE"
                : "ANALYSIS ENGINE";

    }


    if (analysisFooterText) {

        analysisFooterText.textContent =
            state.analysis.source ===
                "SIMULATION"
                ? "SIMULATION ANALYSIS"
                : "ANALYSIS ENGINE ACTIVE";

    }


    if (analysisCompleteText) {

        analysisCompleteText.textContent =
            state.inspectionRunning
                ? "PROCESSING"
                : status === "READY"
                    ? "WAITING"
                    : "ANALYSIS COMPLETE";

    }


    if (analysisStatus) {

        analysisStatus.textContent =
            state.inspectionRunning
                ? "PROCESSING"
                : status === "READY"
                    ? "READY"
                    : "COMPLETE";

    }

}


/* =========================================================
   12. DSA DISPLAY
   ========================================================= */

function updateDSADisplay(
    result = null
) {

    if (result) {

        state.dsa.threshold =
            Number.isFinite(
                Number(
                    result.threshold_ohms
                )
            )
                ? Number(
                    result.threshold_ohms
                )
                : Number.isFinite(
                    Number(
                        result.threshold
                    )
                )
                    ? Number(
                        result.threshold
                    )
                    : null;


        state.dsa.readingCount =
            Number.isFinite(
                Number(
                    result.reading_count
                )
            )
                ? Number(
                    result.reading_count
                )
                : Number.isFinite(
                    Number(
                        result.readingCount
                    )
                )
                    ? Number(
                        result.readingCount
                    )
                    : null;


        state.dsa.abnormalReadings =
            Number.isFinite(
                Number(
                    result.abnormal_readings
                )
            )
                ? Number(
                    result.abnormal_readings
                )
                : Number.isFinite(
                    Number(
                        result.abnormalReadings
                    )
                )
                    ? Number(
                        result.abnormalReadings
                    )
                    : null;


        state.dsa.decision =
            result.dsa_decision ||
            result.dsaDecision ||
            "WAITING";

    }


    if (thresholdValue) {

        thresholdValue.textContent =
            state.dsa.threshold === null
                ? "--"
                : formatNumber(
                    state.dsa.threshold,
                    1
                );

    }


    if (readingCount) {

        readingCount.textContent =
            state.dsa.readingCount === null
                ? "--"
                : String(
                    state.dsa.readingCount
                );

    }


    if (abnormalReadings) {

        abnormalReadings.textContent =
            state.dsa.abnormalReadings === null
                ? "--"
                : String(
                    state.dsa.abnormalReadings
                );

    }


    if (dsaDecision) {

        dsaDecision.textContent =
            String(
                state.dsa.decision ||
                "WAITING"
            ).toUpperCase();

    }


    if (dsaStatus) {

        dsaStatus.textContent =
            state.dsa.decision === "WAITING"
                ? "READY"
                : "LINEAR SEARCH COMPLETE";

    }

}


/* =========================================================
   13. STATISTICS DISPLAY
   ========================================================= */

function updateStatisticsDisplay() {

    if (totalInspections) {

        totalInspections.textContent =
            state.statistics.total;

    }


    if (passedInspections) {

        passedInspections.textContent =
            state.statistics.passed;

    }


    if (failedInspections) {

        failedInspections.textContent =
            state.statistics.failed;

    }


    if (passRate) {

        passRate.textContent =
            `PASS RATE ${
                formatNumber(
                    state.statistics.passRate,
                    1
                )
            }%`;

    }

}


/* =========================================================
   14. LOAD STATISTICS
   ========================================================= */

async function loadStatistics() {

    try {

        const data =
            await apiRequest(
                "/api/statistics"
            );


        if (!data) {

            return;

        }


        state.statistics.total =
            Number(
                data.total ??
                data.total_inspections ??
                0
            );


        state.statistics.passed =
            Number(
                data.passed ??
                data.passed_inspections ??
                0
            );


        state.statistics.failed =
            Number(
                data.failed ??
                data.failed_inspections ??
                0
            );


        const backendPassRate =
            data.pass_rate ??
            data.passRate;


        if (
            Number.isFinite(
                Number(
                    backendPassRate
                )
            )
        ) {

            state.statistics.passRate =
                Number(
                    backendPassRate
                );

        } else if (
            state.statistics.total > 0
        ) {

            state.statistics.passRate =
                (
                    state.statistics.passed /
                    state.statistics.total
                ) * 100;

        } else {

            state.statistics.passRate =
                0;

        }


        updateStatisticsDisplay();


    } catch (error) {

        console.warn(
            "Statistics API unavailable:",
            error.message
        );

    }

}


/* =========================================================
   15. HISTORY HELPERS
   ========================================================= */

function getHistoryArray(
    data
) {

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(
            data.inspections
        )
    ) {

        return data.inspections;

    }


    if (
        data &&
        Array.isArray(
            data.records
        )
    ) {

        return data.records;

    }


    return [];

}


function formatHistoryTime(
    record
) {

    const value =
        record.timestamp ||
        record.time ||
        record.created_at;


    if (!value) {

        return "--";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            value
        );

    }


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


/* =========================================================
   16. RENDER HISTORY
   ========================================================= */

function renderHistory(
    records
) {

    if (!historyRows) {

        return;

    }


    if (!records.length) {

        historyRows.innerHTML = `

            <div class="history-row">

                <span>--</span>

                <span>--</span>

                <span>-- Ω</span>

                <span>--%</span>

                <span>NO RECORDS</span>

            </div>

        `;


        if (historyCount) {

            historyCount.textContent =
                "NO RECORDS";

        }

        return;

    }


    historyRows.innerHTML =
        records
            .slice(
                0,
                CONFIG.historyLimit
            )
            .map(

                record => {

                    const id =
                        record.inspection_id ??
                        record.id ??
                        "--";


                    const resistance =
                        record.resistance_ohms ??
                        record.resistance;


                    const probability =
                        record.crack_probability ??
                        record.crackProbability;


                    const status =
                        String(
                            record.status ||
                            "UNKNOWN"
                        ).toUpperCase();


                    const resistanceText =
                        Number.isFinite(
                            Number(
                                resistance
                            )
                        )
                            ? `${formatNumber(
                                resistance,
                                1
                            )} Ω`
                            : "-- Ω";


                    const probabilityTextValue =
                        Number.isFinite(
                            Number(
                                probability
                            )
                        )
                            ? `${formatNumber(
                                probability,
                                1
                            )}%`
                            : "--%";


                    let statusClass =
                        "";


                    if (
                        status === "PASS"
                    ) {

                        statusClass =
                            "history-pass";

                    } else if (
                        status === "FAIL" ||
                        status === "CRACK DETECTED"
                    ) {

                        statusClass =
                            "history-fail";

                    }


                    return `

                        <div class="history-row">

                            <span>
                                #${escapeHTML(id)}
                            </span>

                            <span>
                                ${formatHistoryTime(
                                    record
                                )}
                            </span>

                            <span>
                                ${resistanceText}
                            </span>

                            <span>
                                ${probabilityTextValue}
                            </span>

                            <span
                                class="${statusClass}"
                            >
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                        </div>

                    `;

                }

            )
            .join("");


    if (historyCount) {

        historyCount.textContent =
            `LAST ${
                Math.min(
                    records.length,
                    CONFIG.historyLimit
                )
            } RECORDS`;

    }

}


/* =========================================================
   17. LOAD HISTORY
   ========================================================= */

async function loadHistory() {

    try {

        const data =
            await apiRequest(

                `/api/inspections?limit=${CONFIG.historyLimit}`

            );


        const records =
            getHistoryArray(
                data
            );


        renderHistory(
            records
        );


    } catch (error) {

        /*
         * The current early backend may not have
         * /api/inspections yet.
         *
         * The dashboard remains functional.
         */

        console.warn(
            "History API unavailable:",
            error.message
        );

    }

}


/* =========================================================
   18. SYSTEM STATUS
   ========================================================= */

async function loadSystemStatus() {

    try {

        const data =
            await apiRequest(
                "/api/status"
            );


        if (!data) {

            return;

        }


        setSystemConnection(
            true
        );


        if (deviceValue) {

            deviceValue.textContent =
                data.device_id ||
                data.device ||
                CONFIG.DEVICE_ID;

        }


        const camera =
            data.camera;


        const sensors =
            data.sensors ||
            data.sensor;


        const analysis =
            data.analysis;


        if (cameraStatus) {

            if (
                typeof camera ===
                "object" &&
                camera !== null
            ) {

                cameraStatus.textContent =
                    camera.connected
                        ? "CONNECTED"
                        : "SIMULATION";

            } else {

                cameraStatus.textContent =
                    "READY";

            }

        }


        if (sensors &&
            typeof sensors ===
            "object"
        ) {

            sensorStatus.textContent =
                sensors.connected
                    ? "ACTIVE"
                    : "SIMULATION";

        }


        if (analysis &&
            typeof analysis ===
            "object"
        ) {

            analysisStatus.textContent =
                analysis.ready
                    ? "READY"
                    : "OFFLINE";

        }


        if (
            data.mode
        ) {

            inspectionMode.textContent =
                String(
                    data.mode
                ).toUpperCase();

        }


    } catch (error) {

        console.warn(
            "Status API unavailable:",
            error.message
        );


        setSystemConnection(
            false
        );

    }

}


/* =========================================================
   19. CAMERA STATUS
   ========================================================= */

async function loadCameraStatus() {

    try {

        const data =
            await apiRequest(
                "/api/camera/status"
            );


        if (!data) {

            return;

        }


        state.camera.connected =
            Boolean(
                data.connected
            );


        state.camera.source =
            data.source ||
            "UNKNOWN";


        state.camera.resolution =
            data.resolution ||
            "--";


        state.camera.fps =
            data.fps ??
            "--";


        state.camera.signal =
            data.signal ||
            "WAITING";


        if (cameraStatus) {

            cameraStatus.textContent =
                state.camera.connected
                    ? "CONNECTED"
                    : (
                        state.camera.source ===
                        "SIMULATION"
                            ? "SIMULATION"
                            : "OFFLINE"
                    );

        }


        if (cameraLiveText) {

            cameraLiveText.textContent =
                state.camera.connected
                    ? "LIVE"
                    : "DEMO";

        }


        if (cameraResolution) {

            cameraResolution.textContent =
                `RESOLUTION ${
                    escapeHTML(
                        state.camera.resolution
                    )
                }`;

        }


        if (cameraFps) {

            cameraFps.textContent =
                `FPS ${
                    escapeHTML(
                        state.camera.fps
                    )
                }`;

        }


        if (cameraVisionStatus) {

            cameraVisionStatus.textContent =
                state.camera.source ===
                "SIMULATION"
                    ? "VISION SIMULATION"
                    : "CAMERA ACTIVE";

        }


        if (cameraFooterStatus) {

            cameraFooterStatus.textContent =
                state.camera.connected
                    ? "VISUAL INSPECTION ACTIVE"
                    : "SIMULATED CAMERA";

        }


        if (cameraStreamStatus) {

            cameraStreamStatus.textContent =
                state.camera.connected
                    ? "STREAM STABLE"
                    : "DEMO STREAM";

        }


        if (cameraFooterDot) {

            cameraFooterDot.classList.toggle(
                "offline",
                !state.camera.connected
            );

        }


        if (
            state.camera.connected &&
            state.camera.source !==
                "SIMULATION"
        ) {

            if (simulatedPcb) {

                simulatedPcb.style.display =
                    "none";

            }

            if (cameraStream) {

                cameraStream.style.display =
                    "block";

            }

        } else {

            if (simulatedPcb) {

                simulatedPcb.style.display =
                    "";

            }

            if (cameraStream) {

                cameraStream.style.display =
                    "none";

            }

        }


    } catch (error) {

        /*
         * Camera endpoint may not exist yet
         * in the current backend.
         */

        console.warn(
            "Camera status unavailable:",
            error.message
        );

    }

}


/* =========================================================
   20. CAMERA FRAME
   ========================================================= */

async function updateCameraFrame() {

    if (!cameraStream) {

        return;

    }


    /*
     * The preferred architecture is:
     *
     * frontend
     *     ↓
     * C++ backend
     *     ↓
     * ESP32-CAM
     *
     * Therefore we request the backend camera
     * endpoint rather than directly connecting
     * the browser to an ESP32 IP.
     */

    try {

        if (
            !state.camera.connected ||
            state.camera.source ===
                "SIMULATION"
        ) {

            return;

        }


        const response =
            await fetch(

                `/api/camera/frame?t=${
                    Date.now()
                }`,

                {
                    cache: "no-store"
                }

            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const blob =
            await response.blob();


        const imageURL =
            URL.createObjectURL(
                blob
            );


        const oldURL =
            cameraStream.dataset.objectUrl;


        cameraStream.src =
            imageURL;


        cameraStream.dataset.objectUrl =
            imageURL;


        if (oldURL) {

            URL.revokeObjectURL(
                oldURL
            );

        }


    } catch (error) {

        console.warn(
            "Camera frame unavailable:",
            error.message
        );

    }

}


/* =========================================================
   21. START INSPECTION
   ========================================================= */

async function startInspection() {

    if (
        state.inspectionRunning
    ) {

        return;

    }


    state.inspectionRunning =
        true;


    setInspectionButton(
        true
    );


    setInspectionProgress(
        "INITIALIZING INSPECTION"
    );


    state.analysis.status =
        "PROCESSING";


    updateAnalysisDisplay();


    if (inspectionControlStatus) {

        inspectionControlStatus.textContent =
            "RUNNING";

    }


    try {

        setInspectionProgress(
            "READING SENSOR DATA"
        );


        /*
         * This is the real inspection call.
         *
         * The backend is responsible for:
         *
         * 1. sensor acquisition
         * 2. resistance calculation
         * 3. array storage
         * 4. linear search
         * 5. threshold comparison
         * 6. abnormal count
         * 7. DSA decision
         * 8. camera analysis
         * 9. final inspection decision
         * 10. database storage
         */

        setInspectionProgress(
            "RUNNING ELECTRICAL DSA"
        );


        const result =
            await apiRequest(

                "/api/inspect",

                {
                    method: "POST",

                    body: JSON.stringify({

                        device_id:
                            CONFIG.DEVICE_ID

                    })

                }

            );


        setInspectionProgress(
            "PROCESSING INSPECTION RESULT"
        );


        if (!result) {

            throw new Error(
                "Empty inspection response"
            );

        }


        applyInspectionResult(
            result
        );


        setInspectionProgress(
            `INSPECTION COMPLETE — ${
                String(
                    result.status ||
                    "UNKNOWN"
                ).toUpperCase()
            }`
        );


        await Promise.all([

            loadStatistics(),

            loadHistory(),

            loadSensorData(),

            loadSystemStatus()

        ]);


    } catch (error) {

        console.error(
            "Inspection failed:",
            error
        );


        state.analysis.status =
            "ERROR";


        if (pcbStatus) {

            pcbStatus.textContent =
                "ERROR";

            pcbStatus.classList.remove(
                "pass-status",
                "fail-status"
            );

        }


        if (pcbStatusDescription) {

            pcbStatusDescription.textContent =
                error.message ||
                "INSPECTION FAILED";

        }


        setInspectionProgress(
            `INSPECTION ERROR: ${
                error.message
            }`
        );


        if (analysisStatus) {

            analysisStatus.textContent =
                "ERROR";

        }

    } finally {

        state.inspectionRunning =
            false;


        setInspectionButton(
            false
        );


        if (inspectionControlStatus) {

            inspectionControlStatus.textContent =
                "READY";

        }


        updateAnalysisDisplay();

    }

}


/* =========================================================
   22. APPLY INSPECTION RESULT
   ========================================================= */

function applyInspectionResult(
    result
) {

    /*
     * Sensor result
     */

    const sensor =
        result.sensor ||
        result;


    if (
        Number.isFinite(
            Number(
                sensor.current_mA
            )
        )
    ) {

        state.sensor.current_mA =
            Number(
                sensor.current_mA
            );

    } else if (
        Number.isFinite(
            Number(
                sensor.current
            )
        )
    ) {

        state.sensor.current_mA =
            Number(
                sensor.current
            );

    }


    if (
        Number.isFinite(
            Number(
                sensor.voltage_V
            )
        )
    ) {

        state.sensor.voltage_V =
            Number(
                sensor.voltage_V
            );

    } else if (
        Number.isFinite(
            Number(
                sensor.voltage
            )
        )
    ) {

        state.sensor.voltage_V =
            Number(
                sensor.voltage
            );

    }


    if (
        Number.isFinite(
            Number(
                sensor.resistance_ohms
            )
        )
    ) {

        state.sensor.resistance_ohms =
            Number(
                sensor.resistance_ohms
            );

    } else if (
        Number.isFinite(
            Number(
                sensor.resistance
            )
        )
    ) {

        state.sensor.resistance_ohms =
            Number(
                sensor.resistance
            );

    }


    /*
     * Analysis result
     */

    const probability =
        result.crack_probability ??
        result.crackProbability;


    if (
        Number.isFinite(
            Number(
                probability
            )
        )
    ) {

        state.analysis.probability =
            Number(
                probability
            );

    }


    const duration =
        result.inspection_time_ms ??
        result.inspectionTimeMs ??
        result.inspection_time ??
        result.inspectionTime;


    if (
        Number.isFinite(
            Number(
                duration
            )
        )
    ) {

        state.analysis.inspectionTime =
            Number(
                duration
            );

    }


    state.analysis.status =
        String(
            result.status ||
            "UNKNOWN"
        ).toUpperCase();


    state.analysis.source =
        result.analysis_source ||
        result.analysisSource ||
        "UNKNOWN";


    /*
     * DSA result
     */

    updateDSADisplay(
        result
    );


    /*
     * Update sensor and analysis UI.
     */

    updateSensorDisplay();

    updateAnalysisDisplay();

}


/* =========================================================
   23. INSPECTION BUTTON STATE
   ========================================================= */

function setInspectionButton(
    running
) {

    if (!inspectButton) {

        return;

    }


    inspectButton.disabled =
        running;


    inspectButton.textContent =
        running
            ? "INSPECTION RUNNING..."
            : "START INSPECTION";

}


/* =========================================================
   24. INSPECTION PROGRESS
   ========================================================= */

function setInspectionProgress(
    message
) {

    if (!inspectionProgress) {

        return;

    }


    const span =
        inspectionProgress.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            message;

    } else {

        inspectionProgress.textContent =
            message;

    }

}


/* =========================================================
   25. CAMERA SCAN EFFECT
   ========================================================= */

function cameraScanEffect() {

    if (!cameraScreen) {

        return;

    }


    cameraScreen.classList.add(
        "scanning"
    );


    setTimeout(

        () => {

            cameraScreen.classList.remove(
                "scanning"
            );

        },

        1200

    );

}


setInterval(
    cameraScanEffect,
    5000
);


/* =========================================================
   26. CAMERA PANEL INTERACTION
   ========================================================= */

if (cameraPanel) {

    cameraPanel.addEventListener(

        "mouseenter",

        () => {

            cameraPanel.style.borderColor =
                "rgba(53,241,207,0.45)";

        }

    );


    cameraPanel.addEventListener(

        "mouseleave",

        () => {

            cameraPanel.style.borderColor =
                "";

        }

    );

}


/* =========================================================
   27. CAMERA SCREEN INTERACTION
   ========================================================= */

if (cameraScreen) {

    cameraScreen.addEventListener(

        "mouseenter",

        () => {

            cameraScreen.style.boxShadow =
                "inset 0 0 35px rgba(53,241,207,0.08)";

        }

    );


    cameraScreen.addEventListener(

        "mouseleave",

        () => {

            cameraScreen.style.boxShadow =
                "";

        }

    );

}


/* =========================================================
   28. PCB CANVAS
   ========================================================= */

const canvas =
    document.getElementById(
        "pcbCanvas"
    );

let ctx = null;


if (canvas) {

    ctx =
        canvas.getContext(
            "2d"
        );

}


/* =========================================================
   29. CANVAS SIZE
   ========================================================= */

function resizeCanvas() {

    if (!canvas) {

        return;

    }


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        window.innerWidth *
        dpr;


    canvas.height =
        window.innerHeight *
        dpr;


    canvas.style.width =
        `${window.innerWidth}px`;


    canvas.style.height =
        `${window.innerHeight}px`;


    if (ctx) {

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }

}


resizeCanvas();


window.addEventListener(

    "resize",

    resizeCanvas

);


/* =========================================================
   30. PCB NODES
   ========================================================= */

let pcbNodes = [];

const NODE_COUNT = 65;


function randomBetween(
    min,
    max
) {

    return (
        Math.random() *
        (max - min)
    ) + min;

}


function createPCBNodes() {

    pcbNodes = [];


    if (!canvas) {

        return;

    }


    for (
        let i = 0;
        i < NODE_COUNT;
        i++
    ) {

        pcbNodes.push({

            x:
                Math.random() *
                window.innerWidth,

            y:
                Math.random() *
                window.innerHeight,

            radius:
                randomBetween(
                    1,
                    2.2
                ),

            speed:
                randomBetween(
                    0.15,
                    0.45
                ),

            pulse:
                Math.random() *
                Math.PI *
                2,

            active:
                Math.random() >
                0.72

        });

    }

}


createPCBNodes();


/* =========================================================
   31. PCB TRACE GENERATION
   ========================================================= */

let pcbTraces = [];


function createPCBTraces() {

    pcbTraces = [];


    if (!canvas) {

        return;

    }


    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const startX =
            Math.random() *
            window.innerWidth;

        const startY =
            Math.random() *
            window.innerHeight;

        const horizontalLength =
            randomBetween(
                50,
                180
            );

        const verticalLength =
            randomBetween(
                30,
                120
            );

        const direction =
            Math.random() > 0.5
                ? 1
                : -1;


        pcbTraces.push({

            x: startX,

            y: startY,

            length:
                horizontalLength,

            vertical:
                verticalLength,

            direction:

                direction,

            speed:
                randomBetween(
                    0.2,
                    0.7
                ),

            offset:
                Math.random() *
                100

        });

    }

}


createPCBTraces();


/* =========================================================
   32. DRAW PCB GRID
   ========================================================= */

function drawPCBGrid() {

    if (
        !ctx ||
        !canvas
    ) {

        return;

    }


    const gridSize =
        55;


    ctx.save();


    ctx.strokeStyle =
        "rgba(53,241,207,0.045)";

    ctx.lineWidth =
        1;


    for (
        let x = 0;
        x < window.innerWidth;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            window.innerHeight
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < window.innerHeight;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            window.innerWidth,
            y
        );

        ctx.stroke();

    }


    ctx.restore();

}


/* =========================================================
   33. DRAW PCB TRACES
   ========================================================= */

function drawPCBTraces(
    time
) {

    if (
        !ctx ||
        !canvas
    ) {

        return;

    }


    ctx.save();


    ctx.lineWidth =
        1.2;


    pcbTraces.forEach(

        trace => {

            const movement =
                (
                    time *
                    trace.speed *
                    0.001
                ) % 1;


            const alpha =
                0.08 +
                Math.sin(
                    time *
                    0.001 +
                    trace.offset
                ) *
                0.025;


            ctx.strokeStyle =
                `rgba(53,241,207,${
                    Math.max(
                        0.04,
                        alpha
                    )
                })`;


            ctx.beginPath();


            ctx.moveTo(
                trace.x,
                trace.y
            );


            ctx.lineTo(
                trace.x +
                trace.length,
                trace.y
            );


            ctx.lineTo(
                trace.x +
                trace.length,
                trace.y +
                trace.vertical *
                trace.direction
            );


            ctx.stroke();


            const pointX =
                trace.x +
                trace.length *
                movement;


            const pointY =
                trace.y;


            ctx.beginPath();


            ctx.arc(

                pointX,

                pointY,

                1.5,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                "rgba(53,241,207,0.55)";


            ctx.fill();

        }

    );


    ctx.restore();

}


/* =========================================================
   34. DRAW PCB NODES
   ========================================================= */

function drawPCBNodes(
    time
) {

    if (
        !ctx ||
        !canvas
    ) {

        return;

    }


    ctx.save();


    pcbNodes.forEach(

        node => {

            const pulse =
                (
                    Math.sin(
                        time *
                        0.002 +
                        node.pulse
                    ) + 1
                ) / 2;


            const radius =
                node.radius +
                pulse *
                0.8;


            const alpha =
                node.active
                    ? 0.20 +
                        pulse *
                        0.25
                    : 0.08 +
                        pulse *
                        0.10;


            ctx.beginPath();


            ctx.arc(

                node.x,

                node.y,

                radius,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                `rgba(53,241,207,${alpha})`;


            ctx.fill();


            if (
                node.active &&
                pulse > 0.72
            ) {

                ctx.beginPath();


                ctx.arc(

                    node.x,

                    node.y,

                    radius + 4,

                    0,

                    Math.PI * 2

                );


                ctx.strokeStyle =
                    "rgba(53,241,207,0.08)";


                ctx.lineWidth =
                    1;


                ctx.stroke();

            }

        }

    );


    ctx.restore();

}


/* =========================================================
   35. CONNECT PCB NODES
   ========================================================= */

function connectPCBNodes() {

    if (
        !ctx ||
        !canvas
    ) {

        return;

    }


    ctx.save();


    for (
        let i = 0;
        i < pcbNodes.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < pcbNodes.length;
            j++
        ) {

            const a =
                pcbNodes[i];

            const b =
                pcbNodes[j];


            const dx =
                a.x -
                b.x;

            const dy =
                a.y -
                b.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance < 135
            ) {

                const opacity =
                    (
                        1 -
                        distance /
                        135
                    ) *
                    0.055;


                ctx.strokeStyle =
                    `rgba(53,241,207,${opacity})`;


                ctx.lineWidth =
                    0.7;


                ctx.beginPath();


                ctx.moveTo(
                    a.x,
                    a.y
                );


                ctx.lineTo(
                    b.x,
                    b.y
                );


                ctx.stroke();

            }

        }

    }


    ctx.restore();

}


/* =========================================================
   36. PCB CANVAS ANIMATION
   ========================================================= */

function animatePCB(
    time
) {

    if (
        !ctx ||
        !canvas
    ) {

        return;

    }


    ctx.clearRect(

        0,

        0,

        window.innerWidth,

        window.innerHeight

    );


    drawPCBGrid();

    drawPCBTraces(
        time
    );

    connectPCBNodes();

    drawPCBNodes(
        time
    );


    requestAnimationFrame(
        animatePCB
    );

}


if (
    canvas &&
    ctx
) {

    requestAnimationFrame(
        animatePCB
    );

}


/* =========================================================
   37. RECREATE PCB BACKGROUND AFTER RESIZE
   ========================================================= */

window.addEventListener(

    "resize",

    () => {

        createPCBNodes();

        createPCBTraces();

    }

);


/* =========================================================
   38. INSPECTION BUTTON EVENT
   ========================================================= */

if (inspectButton) {

    inspectButton.addEventListener(

        "click",

        startInspection

    );

}


/* =========================================================
   39. INITIALIZE DASHBOARD
   ========================================================= */

async function initializeDashboard() {

    if (footerYear) {

        footerYear.textContent =
            `© ${new Date().getFullYear()}`;

    }


    setSystemConnection(
        false
    );


    setInspectionButton(
        false
    );


    setInspectionProgress(
        "CONNECTING TO BACKEND"
    );


    updateSensorDisplay();

    updateAnalysisDisplay();

    updateDSADisplay();

    updateStatisticsDisplay();


    /*
     * Load backend information.
     */

    await Promise.allSettled([

        loadSystemStatus(),

        loadSensorData(),

        loadStatistics(),

        loadHistory(),

        loadCameraStatus()

    ]);


    if (state.connected) {

        setInspectionProgress(
            "READY FOR INSPECTION"
        );

    } else {

        setInspectionProgress(
            "BACKEND CONNECTION REQUIRED"
        );

    }

}


initializeDashboard();


/* =========================================================
   40. PERIODIC BACKEND UPDATES
   ========================================================= */

setInterval(

    () => {

        loadSensorData();

    },

    CONFIG.sensorUpdateInterval

);


setInterval(

    () => {

        loadStatistics();

    },

    CONFIG.statisticsUpdateInterval

);


setInterval(

    () => {

        loadHistory();

    },

    CONFIG.historyUpdateInterval

);


setInterval(

    () => {

        loadSystemStatus();

    },

    5000

);


setInterval(

    () => {

        loadCameraStatus();

    },

    3000

);


setInterval(

    () => {

        updateCameraFrame();

    },

    CONFIG.cameraUpdateInterval

);


/* =========================================================
   41. CONSOLE INFORMATION
   ========================================================= */

console.log(
    "%cBOARDSY",
    "font-size:22px;font-weight:bold;color:#35f1cf;"
);

console.log(
    "PCB Integrity Inspection System"
);

console.log(
    "Frontend initialized."
);

console.log(
    "Data source: C++ backend"
);

console.log(
    "Inspection endpoint: /api/inspect"
);

console.log(
    "Sensor endpoint: /api/data"
);

console.log(
    "Statistics endpoint: /api/statistics"
);

console.log(
    "History endpoint: /api/inspections"
);

console.log(
    "Camera endpoint: /api/camera/frame"
);
/* =========================================================
   ELECTRICAL DSA DISPLAY
   ========================================================= */

/* =========================================================
   BOARDSY
   ELECTRICAL DSA DISPLAY CONTROLLER
   ========================================================= */


/* =========================================================
   HELPER
   ========================================================= */

function getNumber(data, keys, fallback = 0) {

    if (!data) {
        return fallback;
    }

    for (const key of keys) {

        if (
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
        ) {

            const value = Number(data[key]);

            if (Number.isFinite(value)) {
                return value;
            }

        }

    }

    return fallback;
}


function getString(data, keys, fallback = "") {

    if (!data) {
        return fallback;
    }

    for (const key of keys) {

        if (
            data[key] !== undefined &&
            data[key] !== null &&
            String(data[key]).trim() !== ""
        ) {

            return String(data[key]);
        }

    }

    return fallback;
}


/* =========================================================
   UPDATE DSA
   ========================================================= */

function updateDSADisplay(data) {

    if (!data) {
        return;
    }


    /* -----------------------------------------------------
       READ BACKEND VALUES
       ----------------------------------------------------- */

    const threshold = getNumber(
        data,
        [
            "threshold_ohms",
            "thresholdOhms",
            "threshold"
        ],
        0
    );


    const resistance = getNumber(
        data,
        [
            "resistance_ohms",
            "resistanceOhms",
            "resistance"
        ],
        0
    );


    const readingCount = getNumber(
        data,
        [
            "reading_count",
            "readingCount",
            "readings"
        ],
        0
    );


    const abnormalCount = getNumber(
        data,
        [
            "abnormal_readings",
            "abnormalReadings",
            "abnormal"
        ],
        0
    );


    const currentMa = getNumber(
        data,
        [
            "current_ma",
            "current_mA",
            "currentMa",
            "current"
        ],
        0
    );


    const voltageV = getNumber(
        data,
        [
            "voltage_v",
            "voltage_V",
            "voltageV",
            "voltage"
        ],
        0
    );


    const dsaDecision = getString(
        data,
        [
            "dsa_decision",
            "dsaDecision"
        ],
        ""
    ).toUpperCase();


    const status = getString(
        data,
        [
            "status"
        ],
        ""
    ).toUpperCase();


    /* -----------------------------------------------------
       DOM ELEMENTS
       ----------------------------------------------------- */

    const section =
        document.getElementById(
            "electricalDsa"
        );


    const thresholdElement =
        document.getElementById(
            "dsaThreshold"
        );


    const readingsElement =
        document.getElementById(
            "dsaReadings"
        );


    const abnormalElement =
        document.getElementById(
            "dsaAbnormal"
        );


    const decisionElement =
        document.getElementById(
            "dsaDecision"
        );


    const decisionDescription =
        document.getElementById(
            "dsaDecisionDescription"
        );


    const resistanceElement =
        document.getElementById(
            "dsaResistance"
        );


    const resistanceProgress =
        document.getElementById(
            "dsaResistanceProgress"
        );


    const resistancePercent =
        document.getElementById(
            "dsaResistancePercent"
        );


    const equationElement =
        document.getElementById(
            "dsaEquationValue"
        );


    const analysisStatus =
        document.getElementById(
            "dsaAnalysisStatus"
        );


    const headerStatus =
        document.getElementById(
            "dsaHeaderStatus"
        );


    const statusMessage =
        document.getElementById(
            "dsaStatusMessage"
        );


    /* -----------------------------------------------------
       THRESHOLD
       ----------------------------------------------------- */

    if (thresholdElement) {

        thresholdElement.textContent =
            threshold > 0
                ? threshold.toFixed(2) + " Ω"
                : "--";

    }


    /* -----------------------------------------------------
       READINGS
       ----------------------------------------------------- */

    if (readingsElement) {

        readingsElement.textContent =
            readingCount > 0
                ? String(readingCount)
                : "--";

    }


    /* -----------------------------------------------------
       ABNORMAL READINGS
       ----------------------------------------------------- */

    if (abnormalElement) {

        abnormalElement.textContent =
            readingCount > 0
                ? String(abnormalCount)
                : "--";

    }


    /* -----------------------------------------------------
       RESISTANCE
       ----------------------------------------------------- */

    if (resistanceElement) {

        resistanceElement.textContent =
            resistance > 0
                ? resistance.toFixed(2)
                : "--";

    }


    /* -----------------------------------------------------
       RESISTANCE PERCENTAGE
       ----------------------------------------------------- */

    let resistanceRatio = 0;

    if (
        threshold > 0 &&
        resistance >= 0
    ) {

        resistanceRatio =
            (resistance / threshold) * 100;

    }


    if (resistancePercent) {

        resistancePercent.textContent =
            threshold > 0
                ? resistanceRatio.toFixed(1) + "%"
                : "--";

    }


    /* -----------------------------------------------------
       PROGRESS BAR
       ----------------------------------------------------- */

    if (resistanceProgress) {

        const displayPercentage =
            Math.max(
                0,
                Math.min(
                    resistanceRatio,
                    100
                )
            );

        resistanceProgress.style.width =
            displayPercentage + "%";

    }


    /* -----------------------------------------------------
       EQUATION
       ----------------------------------------------------- */

    if (equationElement) {

        if (
            currentMa > 0 &&
            Number.isFinite(voltageV)
        ) {

            const currentA =
                currentMa / 1000;


            const calculatedResistance =
                voltageV / currentA;


            equationElement.textContent =
                voltageV.toFixed(2) +
                " V ÷ " +
                currentA.toFixed(5) +
                " A = " +
                calculatedResistance.toFixed(2) +
                " Ω";

        } else {

            equationElement.textContent =
                "WAITING FOR SENSOR DATA";

        }

    }


    /* -----------------------------------------------------
       DETERMINE DSA RESULT
       ----------------------------------------------------- */

    const isFail =
        abnormalCount > 0 ||
        dsaDecision.includes("FAIL") ||
        dsaDecision.includes("CRACK") ||
        status.includes("FAIL");


    const isPass =
        !isFail &&
        (
            dsaDecision.includes("PASS") ||
            dsaDecision.includes("HEALTHY") ||
            status.includes("PASS")
        );


    /* -----------------------------------------------------
       DECISION
       ----------------------------------------------------- */

    if (decisionElement) {

        decisionElement.classList.remove(
            "fail"
        );


        if (isFail) {

            decisionElement.textContent =
                "FAIL";

            decisionElement.classList.add(
                "fail"
            );

        } else if (isPass) {

            decisionElement.textContent =
                "PASS";

        } else if (readingCount > 0) {

            decisionElement.textContent =
                "CHECK";

        } else {

            decisionElement.textContent =
                "--";

        }

    }


    /* -----------------------------------------------------
       DECISION DESCRIPTION
       ----------------------------------------------------- */

    if (decisionDescription) {

        if (isFail) {

            if (abnormalCount === 1) {

                decisionDescription.textContent =
                    "1 ABNORMAL READING";

            } else {

                decisionDescription.textContent =
                    abnormalCount +
                    " ABNORMAL READINGS";

            }

        } else if (isPass) {

            decisionDescription.textContent =
                "WITHIN THRESHOLD";

        } else if (readingCount > 0) {

            decisionDescription.textContent =
                "ANALYSIS IN PROGRESS";

        } else {

            decisionDescription.textContent =
                "WAITING FOR ANALYSIS";

        }

    }


    /* -----------------------------------------------------
       ANALYSIS STATUS
       ----------------------------------------------------- */

    if (analysisStatus) {

        if (isFail) {

            analysisStatus.textContent =
                "ABNORMAL";

        } else if (isPass) {

            analysisStatus.textContent =
                "STABLE";

        } else if (readingCount > 0) {

            analysisStatus.textContent =
                "ANALYZING";

        } else {

            analysisStatus.textContent =
                "READY";

        }

    }


    /* -----------------------------------------------------
       HEADER STATUS
       ----------------------------------------------------- */

    if (headerStatus) {

        if (isFail) {

            headerStatus.textContent =
                "FAIL";

        } else if (isPass) {

            headerStatus.textContent =
                "PASS";

        } else if (readingCount > 0) {

            headerStatus.textContent =
                "ANALYZING";

        } else {

            headerStatus.textContent =
                "READY";

        }

    }


    /* -----------------------------------------------------
       STATUS MESSAGE
       ----------------------------------------------------- */

    if (statusMessage) {

        if (isFail) {

            statusMessage.textContent =
                "ABNORMAL READING DETECTED";

        } else if (isPass) {

            statusMessage.textContent =
                "LINEAR SEARCH COMPLETE";

        } else if (readingCount > 0) {

            statusMessage.textContent =
                "DSA ANALYSIS IN PROGRESS";

        } else {

            statusMessage.textContent =
                "SYSTEM READY";

        }

    }


    /* -----------------------------------------------------
       SECTION STATE
       ----------------------------------------------------- */

    if (section) {

        section.classList.toggle(
            "dsa-fail",
            isFail
        );

    }


    /* -----------------------------------------------------
       DSA PIPELINE STEPS
       ----------------------------------------------------- */

    const acquisition =
        document.getElementById(
            "dsaStepAcquisition"
        );


    const resistanceStep =
        document.getElementById(
            "dsaStepResistance"
        );


    const searchStep =
        document.getElementById(
            "dsaStepSearch"
        );


    const decisionStep =
        document.getElementById(
            "dsaStepDecision"
        );


    /* DATA ACQUISITION */

    if (acquisition) {

        acquisition.classList.remove(
            "active"
        );

        acquisition.classList.toggle(
            "complete",
            readingCount > 0
        );

    }


    /* RESISTANCE CALCULATION */

    if (resistanceStep) {

        resistanceStep.classList.remove(
            "active"
        );

        resistanceStep.classList.toggle(
            "complete",
            resistance > 0
        );

    }


    /* LINEAR SEARCH */

    if (searchStep) {

        searchStep.classList.remove(
            "active"
        );

        searchStep.classList.toggle(
            "complete",
            readingCount > 0
        );

    }


    /* FINAL DECISION */

    if (decisionStep) {

        decisionStep.classList.remove(
            "active"
        );

        decisionStep.classList.toggle(
            "complete",
            isPass || isFail
        );

    }

}


/* =========================================================
   RESET DSA DISPLAY
   ========================================================= */

function resetDSADisplay() {

    const ids = {

        dsaThreshold: "--",

        dsaReadings: "--",

        dsaAbnormal: "--",

        dsaDecision: "--",

        dsaResistance: "--",

        dsaResistancePercent: "--",

        dsaEquationValue:
            "WAITING FOR SENSOR DATA",

        dsaAnalysisStatus:
            "READY",

        dsaHeaderStatus:
            "READY",

        dsaStatusMessage:
            "SYSTEM READY"

    };


    Object.entries(ids).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value;

            }

        }
    );


    const progress =
        document.getElementById(
            "dsaResistanceProgress"
        );


    if (progress) {

        progress.style.width =
            "0%";

    }


    const section =
        document.getElementById(
            "electricalDsa"
        );


    if (section) {

        section.classList.remove(
            "dsa-fail"
        );

    }


    const steps = [
        "dsaStepAcquisition",
        "dsaStepResistance",
        "dsaStepSearch",
        "dsaStepDecision"
    ];


    steps.forEach(
        (id) => {

            const step =
                document.getElementById(id);

            if (step) {

                step.classList.remove(
                    "complete",
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   INSPECTION RESULT HOOK
   =========================================================
   
   Call this after POST /api/inspect returns.
   ========================================================= */

function handleInspectionResult(result) {

    if (!result) {
        return;
    }


    updateDSADisplay(result);

}


/* =========================================================
   SENSOR DATA HOOK
   =========================================================
   
   This can be called whenever /api/data returns.
   It updates the electrical values without
   inventing resistance in the frontend.
   ========================================================= */

function handleSensorData(data) {

    if (!data) {
        return;
    }


    updateDSADisplay(data);

}
/* =========================================================
   END OF BOARDSY SCRIPT
   ========================================================= */
