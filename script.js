    <script>
        // =================================================
        // 系統第一層頁面切換
        // =================================================

        function switchSystemPage(page) {
        
            document
                .querySelectorAll(".system-page")
                .forEach(function (section) {
        
                    section.classList.remove("active");
        
                });
        
        
            document
                .querySelectorAll(".system-nav-btn")
                .forEach(function (button) {
        
                    button.classList.remove("active");
        
                });
        
        
            const targetPage =
                document.getElementById(
                    "page-" + page
                );
        
        
            if (targetPage) {
        
                targetPage.classList.add(
                    "active"
                );
        
            }
        
        
            const targetButton =
                document.querySelector(
                    '.system-nav-btn[data-page="' +
                    page +
                    '"]'
                );
        
        
            if (targetButton) {
        
                targetButton.classList.add(
                    "active"
                );
        
            }
        
        
            // =================================================
            // 每次切換頁面都先恢復白色背景
            // 只有使用者在「報餐」頁面重新點晚餐
            // 才會透過 blackInput 的 change 事件變黑
            // =================================================
        
            document.body.classList.remove(
                "dark-mode"
            );
        
            document.body.classList.add(
                "white-mode"
            );
     }

        
        const GOOGLE_SCRIPT_URL =
            "https://script.google.com/macros/s/AKfycbz5A0b2thyY6D2ExzqC_IEizobQmFf6mxSHrw2rl7nWaBjsnjqOijuNf13rElb4aQPKUg/exec";
        
        // =================================================
        // 網址授權公司
        // 網頁一開就背景認證
        // =================================================
        
        async function initializeQueryCompanyAuth() {
        
            const queryCompany =
                document.getElementById("queryCompany");
        
            if (!queryCompany) return;
        
        
            // 取得網址帳號
            const pathname =
                window.location.pathname;
        
            const search =
                window.location.search;
        
            let account = "";
        
            if (
                pathname.startsWith("/wuci-lunch/")
            ) {
        
                account =
                    pathname
                        .substring("/wuci-lunch/".length)
                        .split("/")[0]
                        .trim();
        
            }
        
            if (
                !account &&
                search &&
                search !== "?"
            ) {
        
                const q =
                    search.substring(1).trim();
        
                account =
                    q.startsWith("account=")
                        ? decodeURIComponent(q.substring(8))
                        : (
                            !q.includes("=") &&
                            !q.includes("&")
                                ? decodeURIComponent(q)
                                : ""
                        );
        
            }
        
        
            if (!account) return;
        
        
            // 先讀取快取
            const cacheKey =
                "query_company_" + account;
        
            const cached =
                localStorage.getItem(cacheKey);
        
            if (cached) {
                queryCompany.value = cached;
            }
        
        
            // 背景向 GAS 認證
            try {
        
                const response =
                    await fetch(
                        GOOGLE_SCRIPT_URL +
                        "?action=checkQueryAuth" +
                        "&account=" +
                        encodeURIComponent(account)
                    );
        
                const result =
                    await response.json();
        
        
                if (
                    result.success &&
                    result.company
                ) {
        
                    queryCompany.value =
                        result.company;
        
                    localStorage.setItem(
                        cacheKey,
                        result.company
                    );
        
                }
        
            }
            catch (error) {
        
                console.error(
                    "授權查詢失敗：",
                    error
                );
        
            }
        
        }
      

        // =================================================
        // 目前分頁
        // =================================================

        let currentMode =
            "single";

        const inputField =
            document.getElementById(
                "empIdInput"
            );


        const nameInput =
            document.getElementById(
                "nameInput"
            );

        const proxyEmpIdInput =
            document.getElementById(
                "proxyEmpIdInput"
            );


        const companySelect =
            document.getElementById(
                "companySelect"
            );


        const unitSelect =
            document.getElementById(
                "unit"
            );


        const status =
            document.getElementById(
                "statusMsg"
            );


        const submitBtn =
            document.getElementById(
                "submitBtn"
            );

        const singleDateInput =
            document.getElementById(
                "single-date"
            );

        // =================================================
        // 代報人工號檢查
        // =================================================
        
        proxyEmpIdInput.addEventListener(
            "input",
            function () {
        
                this.value =
                    this.value.toUpperCase();
        
            }
        );
        
        
        proxyEmpIdInput.addEventListener(
            "blur",
            function () {
        
                const empId =
                    inputField.value
                        .trim()
                        .toUpperCase();
        
                const proxyEmpId =
                    proxyEmpIdInput.value
                        .trim()
                        .toUpperCase();
        
                inputField.value =
                    empId;
        
                proxyEmpIdInput.value =
                    proxyEmpId;
        
        
                // ---------------------------------------------
                // 代報人工號等於報餐人工號
                // ---------------------------------------------
        
                if (
                    proxyEmpId !== "" &&
                    empId !== "" &&
                    proxyEmpId === empId
                ) {
        
                    status.style.color =
                        "#dc3545";
        

                    alert(
                        " ❌ 為自己報餐時，不需填寫此欄！"
                    );
        
                    proxyEmpIdInput.value = "";
        
                    proxyEmpIdInput.focus();
                
                        }
        
            }
        );
        
        // =================================================
        // 工號輸入內容改變時清除目前員工的資料
        // =================================================

        inputField.addEventListener(
            "input",
            function () {
        
        
                // 只要工號被修改，就清除原本員工資料
                nameInput.value = "";
        
                companySelect.value = "";
        
                unitSelect.value = "";
        
                // 清除代報人工號
                proxyEmpIdInput.value = "";
        
                // 清除狀態訊息
                status.innerHTML = "";
        
            }
        );
        
                
        
        // =================================================
        // 工號查詢員工資料
        // =================================================
        
        inputField.addEventListener(
            "blur",
            async function () {
        
                const empId =
                    inputField.value
                        .trim()
                        .toUpperCase();
        
        
                inputField.value =
                    empId;


        // =================================================
        // 沒有工號，不查詢
        // =================================================

        if (!empId) {

            return;

        }


        // =================================================
        // 顯示「正在查詢」視窗
        // =================================================

        const loadingOverlay =
            document.getElementById(
                "loadingOverlay"
            );

        const loadingText =
            document.getElementById(
                "loadingText"
            );


        loadingText.innerText =
            "正在查詢員工資料，請稍候...";


        loadingOverlay.style.display =
            "flex";


        // =================================================
        // 顯示狀態
        // =================================================

        status.style.color =
            "#666";

        status.innerHTML =
            "⏳ 正在查詢員工資料...";


        try {

            // =================================================
            // ⭐ 保留原本成功的 GET 查詢方式
            // =================================================

            const response =
                await fetch(
                    GOOGLE_SCRIPT_URL +
                    "?employeeId=" +
                    encodeURIComponent(
                        empId
                    )
                );


            const result =
                await response.json();


            console.log(
                "員工查詢結果：",
                result
            );


            // =================================================
            // 查詢完成
            // =================================================

            if (!result.success) {

                // ---------------------------------------------
                // 查詢失敗
                // ---------------------------------------------

                nameInput.value =
                    "";

                companySelect.value =
                    "";

                unitSelect.value =
                    "";


                // 清除代報人工號
                proxyEmpIdInput.value =
                    "";


                // 關閉查詢視窗
                loadingOverlay.style.display =
                    "none";


                status.style.color =
                    "#dc3545";

                status.innerHTML =
                    "❌ " +
                    (
                        result.message ||
                        "查無此員工工號"
                    );

                alert(
                    "❌ 查無此員工工號！\n\n請確認您輸入的工號是否正確。"
                );


                return;

            }


            // =================================================
            // 查詢成功
            // =================================================

            /*
             * 注意：
             * 你的 GAS 回傳格式是：
             *
             * result.employee.name
             * result.employee.company
             * result.employee.unit
             *
             * 不是：
             *
             * result.name
             */

            nameInput.value =
                result.employee?.name ||
                "";

            companySelect.value =
                result.employee?.company ||
                "";

            unitSelect.value =
                result.employee?.unit ||
                "";


            // =================================================
            // ⭐ 查詢完成後清除代報人工號
            // =================================================

            proxyEmpIdInput.value =
                "";


            // =================================================
            // ⭐ 工號不記錄
            // =================================================

            localStorage.removeItem(
                "company_lunch_employee_id"
            );

            // =================================================
            // 關閉查詢視窗
            // =================================================

            loadingOverlay.style.display =
                "none";


            // =================================================
            // 顯示成功
            // =================================================

            status.style.color =
                "#28a745";

            status.innerHTML =
                "✅ 員工資料查詢成功";


        }


        catch (error) {

            console.error(
                "查詢員工資料失敗：",
                error
            );


            // =================================================
            // 發生錯誤
            // =================================================

            proxyEmpIdInput.value =
                "";


            // 關閉查詢視窗
            loadingOverlay.style.display =
                "none";


            status.style.color =
                "#dc3545";

            status.innerHTML =
                "❌ 無法取得員工資料，請稍後再試。";

        }

    }
);




        // =================================================
        // 午餐 / 晚餐背景
        // =================================================

        const whiteInput =
            document.getElementById(
                "white"
            );


        const blackInput =
            document.getElementById(
                "black"
            );


        whiteInput.addEventListener(
            "change",
            function () {
        
                if (this.checked) {
        
                    document.body.classList.add(
                        "white-mode"
                    );
        
                    document.body.classList.remove(
                        "dark-mode"
                    );
        
                }
        
            }
        );


        blackInput.addEventListener(
            "change",
            function () {
        
                if (this.checked) {
        
                    document.body.classList.add(
                        "dark-mode"
                    );
        
                    document.body.classList.remove(
                        "white-mode"
                    );
        
                }
        
            }
        );


        // =================================================
        // 日期格式
        // =================================================

        function formatLocalDate(date) {

            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            return (
                year +
                "-" +
                month +
                "-" +
                day
            );

        }

        // =================================================
        // 報餐時間設定
        // =================================================
        
        const LUNCH_DEADLINE_HOUR = 9;
        
        const DINNER_DEADLINE_HOUR = 14;
        
        
        // =================================================
        // 取得目前台灣時間
        // =================================================
        
        function getTaiwanNow() {
        
            const now =
                new Date();
        
            const taiwanString =
                now.toLocaleString(
                    "en-US",
                    {
                        timeZone:
                            "Asia/Taipei"
                    }
                );
        
            return new Date(
                taiwanString
            );
        
        }


        // =================================================
        // 顯示目前時間
        // =================================================
        
        function updateCurrentTime() {
        
            const timeElement =
                document.getElementById(
                    "current-time"
                );
        
        
            if (!timeElement) {
        
                return;
        
            }
        
        
            const now =
                getTaiwanNow();
        
        
            const year =
                now.getFullYear();
        
        
            const month =
                String(
                    now.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );
        
        
            const day =
                String(
                    now.getDate()
                ).padStart(
                    2,
                    "0"
                );
        
        
            const hours =
                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                );
        
        
            const minutes =
                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                );
        
        
            const seconds =
                String(
                    now.getSeconds()
                ).padStart(
                    2,
                    "0"
                );
        
        
            timeElement.innerText =
                `🕐 目前時間：${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        }


        // =================================================
        // 檢查單日報餐時間
        // =================================================
        
        function checkSingleMealTime() {
        
            const dateInput =
                document.getElementById(
                    "single-date"
                );
        
        
            if (!dateInput) {
        
                return true;
        
            }
        
        
            const selectedDate =
                dateInput.value;
        
        
            // -------------------------------------------------
            // 沒選日期
            // -------------------------------------------------
        
            if (!selectedDate) {
        
                return true;
        
            }
        
        
            const now =
                getTaiwanNow();
        
        
            const today =
                formatLocalDate(
                    now
                );
        
        
            // -------------------------------------------------
            // 未來日期
            //
            // 不受當天截止時間限制
            // -------------------------------------------------
        
            if (
                selectedDate !== today
            ) {
                
                return true;
        
            }
        
        
            // -------------------------------------------------
            // 取得目前餐別
            // -------------------------------------------------
        
            const mealTime =
                document.querySelector(
                    'input[name="mealTime"]:checked'
                )?.value || "";
        
        
            const currentHour =
                now.getHours();
        
        
            const currentMinute =
                now.getMinutes();
        
        
            const currentTime =
                currentHour * 60 +
                currentMinute;
        
        
            // -------------------------------------------------
            // 午餐
            // 截止 09:00
            // -------------------------------------------------
        
            if (
                mealTime === "午餐"
            ) {
        
                const deadline =
                    LUNCH_DEADLINE_HOUR * 60;
        
        
                if (
                    currentTime >= deadline
                ) {
        
                    return false;
        
                }
        
            }
        
        
            // -------------------------------------------------
            // 晚餐
            // 截止 14:00
            // -------------------------------------------------
        
            if (
                mealTime === "晚餐"
            ) {
        
                const deadline =
                    DINNER_DEADLINE_HOUR * 60;
        
        
                if (
                    currentTime >= deadline
                ) {
        
                    return false;
        
                }
        
            }
        
        
            // -------------------------------------------------
            // 可以報餐
            // -------------------------------------------------
        
        
            return true;
        
        }
        

// =================================================
// 初始化日期
// 今天～未來30天
// =================================================

function initializeDates() {

    const today =
        new Date();


    // -------------------------------------------------
    // 開始日期：今天
    // -------------------------------------------------

    const startDate =
        new Date(
            today
        );


    // -------------------------------------------------
    // 結束日期：今天 + 30 天
    // -------------------------------------------------

    const endDate =
        new Date(
            today
        );

    endDate.setDate(
        endDate.getDate() + 30
    );


    const minStr =
        formatLocalDate(
            startDate
        );


    const maxStr =
        formatLocalDate(
            endDate
        );


    // =================================================
    // 單日報餐
    // =================================================

    singleDateInput.addEventListener(
        "change",
        function () {
    
            const selectedDate =
                this.value;
    
            const today =
                formatLocalDate(
                    new Date()
                );
    
            const maxDate =
                new Date();
    
            maxDate.setDate(
                maxDate.getDate() + 30
            );
    
            const maxDateStr =
                formatLocalDate(
                    maxDate
                );
    
    
            // -----------------------------------------
            // 選到今天以前
            // -----------------------------------------
    
            if (
                selectedDate < today
            ) {
    
                alert(
                    "❌ 報餐日期不能選擇今天以前的日期！"
                );
    
                this.value =
                    today;
    
                return;
    
            }
    
    
            // -----------------------------------------
            // 超過未來 30 天
            // -----------------------------------------
    
            if (
                selectedDate > maxDateStr
            ) {
    
                alert(
                    "❌ 報餐日期最多只能選擇今天起 30 天內！"
                );
    
                this.value =
                    maxDateStr;
    
                return;
    
            }
    
        }
    );

    singleDateInput.min =
        minStr;


    singleDateInput.max =
        maxStr;


    // 預設選擇今天
    singleDateInput.value =
        minStr;



    // =================================================
    // 多日報餐
    // =================================================

    const multiContainer =
        document.getElementById(
            "multi-date-list"
        );


    multiContainer.innerHTML =
        "";


    let tempDate =
        new Date(
            startDate
        );


    while (
        tempDate <= endDate
    ) {


        const dateStr =
            formatLocalDate(
                tempDate
            );


        const weekDay =
            [
                "日",
                "一",
                "二",
                "三",
                "四",
                "五",
                "六"
            ][
                tempDate.getDay()
            ];


        const label =
            document.createElement(
                "label"
            );


        label.className =
            "date-item";


        label.innerHTML = `

            <input
                type="checkbox"
                name="multi-dates"
                value="${dateStr}"
            >

            ${dateStr}
            (${weekDay})

        `;


        multiContainer.appendChild(
            label
        );


        // 下一天
        tempDate.setDate(
            tempDate.getDate() + 1
        );

    }


        // =================================================
        // 餐點統計日期
        // 今天～未來30天
        // =================================================
        
        const statisticsDate =
            document.getElementById(
                "statisticsDate"
            );
        
        if (statisticsDate) {
        
            statisticsDate.min =
                minStr;
        
            statisticsDate.max =
                maxStr;
        
            statisticsDate.value =
                minStr;
        
        }


}






        // =================================================
        // 分頁
        // =================================================

        function switchTab(mode) {


            currentMode =
                mode;


            document
                .querySelectorAll(
                    ".tab-btn"
                )
                .forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


            document
                .querySelectorAll(
                    ".tab-btn"
                )
                .forEach(
                    btn => {

                        if (
                            (
                                mode === "single" &&
                                btn.innerText.includes(
                                    "單日報餐"
                                )
                            )
                            ||
                            (
                                mode === "multi" &&
                                btn.innerText.includes(
                                    "多日報餐"
                                )
                            )
                        ) {

                            btn.classList.add(
                                "active"
                            );

                        }

                    }
                );


            document
                .querySelectorAll(
                    ".tab-content"
                )
                .forEach(
                    content => {

                        content.classList.remove(
                            "active"
                        );

                    }
                );


            const targetTab =
                document.getElementById(
                    "tab-" + mode
                );


            if (targetTab) {

                targetTab.classList.add(
                    "active"
                );

            }


            status.innerHTML =
                "";

        }

        
        // =================================================
        // 查詢條件：用餐時段
        // 全部 / 午餐 / 晚餐
        // =================================================
        
        function selectQueryMealTime(mealTime) {
        
        // ---------------------------------------------
        // 設定實際查詢值
        // ---------------------------------------------
        
        const mealTimeInput =
            document.getElementById(
                "queryMealTime"
            );
        
        if (mealTimeInput) {
        
            mealTimeInput.value =
                mealTime;
        
        }
        
        
        // ---------------------------------------------
        // 更新按鈕樣式
        // ---------------------------------------------
        
        document
            .querySelectorAll(
                ".query-meal-btn"
            )
            .forEach(
                function(button) {
        
                    button.classList.remove(
                        "active"
                    );
        
                }
            );
        
        
        const selectedButton =
            document.querySelector(
                '.query-meal-btn[data-meal-time="' +
                mealTime +
                '"]'
            );
        
        
        if (selectedButton) {
        
            selectedButton.classList.add(
                "active"
            );
        
        }
        
        
        }

        // =================================================
        // 檢查是否選到「週日晚餐」
        // =================================================
        
        function hasSundayDinner(selectedDates, mealTime) {
        
            if (mealTime !== "晚餐") {
                return false;
            }
        
            return selectedDates.some(
                function(dateString) {
        
                    const date =
                        new Date(
                            dateString + "T00:00:00"
                        );
        
                    return date.getDay() === 0;
        
                }
            );
        
        }



        // =================================================
        // 取得選擇日期
        // =================================================

        function getSelectedDates() {


            const dates = [];


            if (
                currentMode === "single"
            ) {


                const date =
                    document
                        .getElementById(
                            "single-date"
                        )
                        .value;


                if (date) {

                    dates.push(
                        date
                    );

                }

            }

            else {


                document
                    .querySelectorAll(
                        'input[name="multi-dates"]:checked'
                    )
                    .forEach(
                        checkbox => {

                            dates.push(
                                checkbox.value
                            );

                        }
                    );

            }


            return dates;

        }



        // =================================================
        // 報餐
        // =================================================

        window.submitOrder =
            async function () {


                // -------------------------------------------------
                // 檢查網址
                // -------------------------------------------------

                if (
                    !GOOGLE_SCRIPT_URL ||
                    GOOGLE_SCRIPT_URL.includes(
                        "請把你的"
                    )
                ) {

                    status.style.color =
                        "#dc3545";

                    status.innerHTML =
                        "❌ 尚未設定 Google Apps Script 網址。";

                    return;

                }



                // -------------------------------------------------
                // 取得資料
                // -------------------------------------------------

                const empId =
                    inputField.value
                        .trim()
                        .toUpperCase();


                const name =
                    nameInput.value
                        .trim();

                const proxyEmpId =
                    proxyEmpIdInput.value
                        .trim()
                        .toUpperCase();


                const company =
                    companySelect.value;


                const unit =
                    unitSelect.value;


                const mealTime =
                    document
                        .querySelector(
                            'input[name="mealTime"]:checked'
                        )
                        ?.value || "";


                const category =
                    document
                        .querySelector(
                            'input[name="category"]:checked'
                        )
                        ?.value || "";


                const selectedDates =
                    getSelectedDates();

        // =================================================
        // 週日晚餐禁止報餐
        // 單日、多日只要包含星期日
        // 整次報餐直接停止
        // =================================================
        
        if (
            hasSundayDinner(
                selectedDates,
                mealTime
            )
        ) {
        
            alert(
                "⚠️ 週日不提供晚餐！\n\n" +
                "您選擇的報餐日期包含星期日，" +
                "請重新選擇報餐日期或改選其他餐別。"
            );
        
            status.style.color =
                "#dc3545";
        
            status.innerHTML =
                "❌ 週日不提供晚餐，請重新選擇報餐日期或餐別。";
        
            return;
        
        }

        // -------------------------------------------------
        // 檢查當天報餐截止時間
        // -------------------------------------------------
        
        const now =
            getTaiwanNow();
        
        const today =
            formatLocalDate(now);
        
        const currentTime =
            now.getHours() * 60 +
            now.getMinutes();
        
        
        // =================================================
        // 過濾已經超過截止時間的「今天」
        // 未來日期不受影響
        // =================================================
        
        const validDates =
            selectedDates.filter(
                orderDate => {
        
                    // -----------------------------------------
                    // 未來日期
                    // 直接保留
                    // -----------------------------------------
        
                    if (
                        orderDate !== today
                    ) {
        
                        return true;
        
                    }
        
        
                    // -----------------------------------------
                    // 今天 + 午餐
                    // -----------------------------------------
        
                    if (
                        mealTime === "午餐" &&
                        currentTime >= 9 * 60
                    ) {
        
                        return false;
        
                    }
        
        
                    // -----------------------------------------
                    // 今天 + 晚餐
                    // -----------------------------------------
        
                    if (
                        mealTime === "晚餐" &&
                        currentTime >= 14 * 60
                    ) {
        
                        return false;
        
                    }
        
        
                    // -----------------------------------------
                    // 今天尚未超過截止時間
                    // -----------------------------------------
        
                    return true;
        
                }
            );
        
        
        // =================================================
        // 如果所有日期都不能報餐
        // =================================================
        
        if (
            validDates.length === 0
        ) {
        
            status.style.color =
                "#dc3545";
        
            if (
                mealTime === "午餐"
            ) {
        
                status.innerHTML =
                    "❌ 今日午餐已超過 09:00 截止時間，無法報餐。";
        
            }
            else {
        
                status.innerHTML =
                    "❌ 今日晚餐已超過 14:00 截止時間，無法報餐。";
        
            }
        
            return;
        
        }
        
        
        // =================================================
        // 如果有部分日期被排除
        // =================================================
        
        if (
            validDates.length <
            selectedDates.length
        ) {
        
            status.style.color =
                "#ff9800";
        
        }


                // -------------------------------------------------
                // 驗證
                // -------------------------------------------------

                if (!empId) {

                    status.style.color =
                        "#dc3545";

                    status.innerHTML =
                        "❌ 請先輸入您的員工代號！";

                    inputField.focus();

                    return;

                }


                if (!name) {

                    status.style.color =
                        "#dc3545";

                    status.innerHTML =
                        "❌ 請輸入您的姓名！";

                    nameInput.focus();

                    return;

                }


                if (!company) {

                    status.style.color =
                        "#dc3545";

                    status.innerHTML =
                        "❌ 請選擇公司！";

                    companySelect.focus();

                    return;

                }


                if (!unit) {

                    status.style.color =
                        "#dc3545";

                    status.innerHTML =
                        "❌ 請選擇單位！";

                    unitSelect.focus();

                    return;

                }


                if (
                    selectedDates.length === 0
                ) {

                    status.style.color =
                        "#dc3545";

                    status.innerHTML =
                        "❌ 請至少選擇一個報餐日期！";

                    return;

                }



                // -------------------------------------------------
                // 禁止重複按鈕
                // -------------------------------------------------

                submitBtn.disabled =
                    true;


                submitBtn.innerText =
                    "⏳ 傳送中...";


                status.style.color =
                    "#666";


                status.innerHTML =
                    "⏳ 正在傳送報餐資料...";

                // =================================================
                // 一次傳送全部日期
                // =================================================

                let successCount =
                    0;


                let failCount =
                    0;


                let resultMessages =
                    [];

                try {
                
                    const data = {
                
                        dates:
                            validDates,
                
                        mealTime:
                            mealTime,
                
                        category:
                            category,
                
                        employeeId:
                            empId,
                
                        name:
                            name,
                
                        company:
                            company,
                
                        unit:
                            unit,
                
                        proxyEmployeeId:
                            proxyEmpId
                
                    };
                
                
                    console.log(
                        "一次傳送報餐資料：",
                        data
                    );
                
                
                    const response =
                        await fetch(
                            GOOGLE_SCRIPT_URL,
                            {
                
                                method:
                                    "POST",
                
                                headers: {
                
                                    "Content-Type":
                                        "text/plain;charset=utf-8"
                
                                },
                
                                body:
                                    JSON.stringify(data)
                
                            }
                        );
                
                
                    const result =
                        await response.json();
                
                
                    console.log(
                        "Google 回應：",
                        result
                    );             

                // =================================================
                // 處理 GAS 回傳的每一天結果
                // =================================================
                
                if (
                    Array.isArray(result.results)
                ) {
                
                    result.results.forEach(
                        item => {
                
                            if (
                                item.success
                            ) {
                
                                resultMessages.push(`
                
                                    <div class="result-success">
                
                                        ✅ ${item.date}
                                        報餐成功
                
                                    </div>
                
                                `);
                
                            }
                
                            else {
                
                                resultMessages.push(`
                
                                    <div class="result-fail">
                
                                        ❌ ${item.date}
                                        報餐失敗：
                                        ${
                                            item.message ||
                                            "未知錯誤"
                                        }
                
                                    </div>
                
                                `);
                
                            }
                
                        }
                    );
                
                }
                
                
                // =================================================
                // 今天是否因截止時間被跳過
                // =================================================
                //
                // selectedDates = 使用者原本選的日期
                //
                // validDates = 實際送給 GAS 的日期
                //
                // 如果今天原本有選，但被 validDates 排除
                // 就代表今天因為超過截止時間而失敗
                //
                
                const skippedToday =
                    selectedDates.includes(today) &&
                    !validDates.includes(today);
                
                
                // =================================================
                // 截止時間造成的失敗數
                // =================================================
                
                const skippedFailCount =
                    skippedToday ? 1 : 0;
                
                
                // =================================================
                // 最終失敗總數
                // =================================================
                //
                // GAS 回報的失敗
                // +
                // 今天因截止時間被排除的失敗
                //
                
                const totalFailCount =
                    (result.failCount || 0) +
                    skippedFailCount;
                
                
                // =================================================
                // 最終成功數
                // =================================================
                
                const totalSuccessCount =
                    result.successCount || 0;
                
                
                // =================================================
                // 顏色
                // =================================================
                
                if (
                    totalFailCount === 0
                ) {
                
                    status.style.color =
                        "#28a745";
                
                }
                
                else if (
                    totalSuccessCount > 0
                ) {
                
                    status.style.color =
                        "#ff9800";
                
                }
                
                else {
                
                    status.style.color =
                        "#dc3545";
                
                }
                
                
                // =================================================
                // 顯示最後結果
                // =================================================
                
                status.innerHTML = `
                
                    <div class="status-title">
                
                        🎉 報餐處理完成
                
                    </div>
                
                
                    ${skippedToday ? `
                        <div style="
                            color:#dc3545;
                            text-align:center;
                            margin-bottom:12px;
                        ">
                            ⚠️ 今天因已超過報餐截止時間，無法報餐
                        </div>
                    ` : ""}
                
                
                    <div style="
                        text-align:center;
                        margin-bottom:12px;
                    ">
                
                        成功
                        ${result.successCount || 0}
                        天　
                        失敗
                        ${totalFailCount}
                        天
                
                    </div>
                
                
                    ${resultMessages.join("")}
                
                `;
                
                } catch (error) {
                
                    console.error(
                        "報餐系統錯誤：",
                        error
                    );
                
                
                    status.style.color =
                        "#dc3545";
                
                    status.innerHTML =
                        "❌ 報餐處理失敗，請稍後再試。";
                
                }




                // -------------------------------------------------
                // 恢復按鈕
                // -------------------------------------------------

                finally {

                    submitBtn.disabled =
                        false;


                    submitBtn.innerText =
                        "🙋‍♂️ 我要報餐";

                }

            };

        // =================================================
        // 查詢日期區間限制
        // 今天～未來30天
        // =================================================
        
        function initializeQueryDates() {
        
            const startInput =
                document.getElementById(
                    "queryStartDate"
                );
        
            const endInput =
                document.getElementById(
                    "queryEndDate"
                );
        
        
            if (
                !startInput ||
                !endInput
            ) {
        
                return;
        
            }
        
        
            // -------------------------------------------------
            // 今天
            // -------------------------------------------------
        
            const today =
                new Date();
        
        
            const todayStr =
                formatLocalDate(
                    today
                );
        
        
            // -------------------------------------------------
            // 今天 + 30 天
            // -------------------------------------------------
        
            const maxDate =
                new Date(
                    today
                );
        
        
            maxDate.setDate(
                maxDate.getDate() + 30
            );
        
        
            const maxDateStr =
                formatLocalDate(
                    maxDate
                );
        
        
            // -------------------------------------------------
            // 設定 HTML 原生限制
            // -------------------------------------------------
        
            startInput.min =
                todayStr;
        
            startInput.max =
                maxDateStr;
        
        
            endInput.min =
                todayStr;
        
            endInput.max =
                maxDateStr;
        
        
            // -------------------------------------------------
            // 預設日期
            // -------------------------------------------------
        
            startInput.value =
                todayStr;
        
            endInput.value =
                maxDateStr;
        
        
            // =================================================
            // 起始日期變更
            // =================================================
        
            startInput.addEventListener(
                "change",
                function () {
        
                    const selectedDate =
                        this.value;
        
        
                    // ---------------------------------------------
                    // 超過 30 天
                    // ---------------------------------------------
        
                    if (
                        selectedDate > maxDateStr
                    ) {
        
                        alert(
                            "❌ 查詢日期最多只能選擇今天起 30 天內！"
                        );
        
        
                        this.value =
                            todayStr;
        
        
                        return;
        
                    }
        
        
                    // ---------------------------------------------
                    // 今天以前
                    // ---------------------------------------------
        
                    if (
                        selectedDate < todayStr
                    ) {
        
                        alert(
                            "❌ 查詢日期不能選擇今天以前的日期！"
                        );
        
        
                        this.value =
                            todayStr;
        
        
                        return;
        
                    }
        
        
                    // ---------------------------------------------
                    // 起始日期不能晚於結束日期
                    // ---------------------------------------------
        
                    if (
                        endInput.value &&
                        selectedDate > endInput.value
                    ) {
        
                        alert(
                            "❌ 起始日期不能晚於結束日期！"
                        );
        
        
                        this.value =
                            endInput.value;
        
                    }
        
                }
            );
        
        
            // =================================================
            // 結束日期變更
            // =================================================
        
            endInput.addEventListener(
                "change",
                function () {
        
                    const selectedDate =
                        this.value;
        
        
                    // ---------------------------------------------
                    // 超過 30 天
                    // ---------------------------------------------
        
                    if (
                        selectedDate > maxDateStr
                    ) {
        
                        alert(
                            "❌ 查詢日期最多只能選擇今天起 30 天內！"
                        );
        
        
                        this.value =
                            maxDateStr;
        
        
                        return;
        
                    }
        
        
                    // ---------------------------------------------
                    // 今天以前
                    // ---------------------------------------------
        
                    if (
                        selectedDate < todayStr
                    ) {
        
                        alert(
                            "❌ 查詢日期不能選擇今天以前的日期！"
                        );
        
        
                        this.value =
                            todayStr;
        
        
                        return;
        
                    }
        
        
                    // ---------------------------------------------
                    // 結束日期不能早於開始日期
                    // ---------------------------------------------
        
                    if (
                        startInput.value &&
                        selectedDate < startInput.value
                    ) {
        
                        alert(
                            "❌ 結束日期不能早於開始日期！"
                        );
        
        
                        this.value =
                            startInput.value;
        
                    }
        
                }
            );
        
        }


        // =================================================
        // Service Worker
        // =================================================

        if (
            "serviceWorker" in navigator
        ) {


            navigator.serviceWorker
                .register(
                    "/wuci-lunch/sw.js"
                )
                .catch(
                    err => {

                        console.log(
                            "Service Worker 註冊失敗：",
                            err
                        );

                    }
                );

        }



        // =================================================
        // 網頁載入
        // =================================================

        document.addEventListener(
            "DOMContentLoaded",
            function () {
        
                initializeDates();

                initializeQueryDates();
    
                initializeQueryCompanyAuth();
        
                loadMenu();
        
            }
        );

        // =================================================
        // 目前時間即時更新
        // =================================================
        
        setInterval(
            function () {
        
                updateCurrentTime();
        
            },
            1000
        );

        // =================================================
        // 查詢結果分頁
        // =================================================
        
        const QUERY_PAGE_SIZE = 20;
        
        let queryResults = [];
        
        let queryCurrentPage = 1;

        // =================================================
        // 查詢報餐
        // =================================================
        
        async function queryOrders() {
        
            const employeeId =
                document
                    .getElementById("queryEmployeeId")
                    .value
                    .trim()
                    .toUpperCase();
        
            const company =
                document
                    .getElementById("queryCompany")
                    .value
                    .trim();

            const mealTime =
                document
                    .getElementById("queryMealTime")
                    .value;
        
            const startDate =
                document
                    .getElementById("queryStartDate")
                    .value;
        
            const endDate =
                document
                    .getElementById("queryEndDate")
                    .value;
        
        
            const resultBox =
                document.getElementById(
                    "queryResult"
                );


                // =================================================
                // 工號／公司至少要填寫一個
                // =================================================
                
                if (!employeeId && !company) {
                
                    resultBox.innerHTML = `
                        <div class="result-fail">
                            ❌ 請輸入員工工號或公司名稱！
                        </div>
                    `;
                
                    return;
                
                }
        
            resultBox.innerHTML =
                "⏳ 查詢中，請稍候...";
        
        
            try {
    

                const url =
                    GOOGLE_SCRIPT_URL +
                    "?action=queryOrders" +
                    "&employeeId=" +
                    encodeURIComponent(employeeId) +
                    "&company=" +
                    encodeURIComponent(company) +
                    "&mealTime=" +
                    encodeURIComponent(mealTime) +
                    "&startDate=" +
                    encodeURIComponent(startDate) +
                    "&endDate=" +
                    encodeURIComponent(endDate);
        
        
                const response =
                    await fetch(url);
        
        
                const result =
                    await response.json();
        
        
                console.log(
                    "報餐查詢結果：",
                    result
                );
        
        
                if (!result.success) {
        
                    resultBox.innerHTML =
                        `
                        <div class="result-fail">
                            ❌ ${
                                result.message ||
                                "查詢失敗"
                            }
                        </div>
                        `;
        
                    return;
        
                }
        
        
                if (
                    !Array.isArray(result.results) ||
                    result.results.length === 0
                ) {
        
                    resultBox.innerHTML =
                        `
                        <div class="hint">
                            查無符合條件的報餐資料
                        </div>
                        `;
        
                    return;
        
                }
        
        
        // =================================================
        // 儲存查詢結果
        // =================================================
        
        queryResults =
            result.results;
        
        
        // =================================================
        // 回到第 1 頁
        // =================================================
        
        queryCurrentPage = 1;
        
        
        // =================================================
        // 顯示第 1 頁
        // =================================================
        
        renderQueryResults();
        

        
        
            }
        
            catch (error) {
        
                console.error(
                    "查詢報餐失敗：",
                    error
                );
        
        
                resultBox.innerHTML =
                    `
                    <div class="result-fail">
                        ❌ 無法取得報餐資料，請稍後再試。
                    </div>
                    `;
        
            }
        
        }

        // =================================================
        // 查詢結果：顯示指定頁面
        // 每頁最多 40 筆
        // =================================================
        
        function renderQueryResults() {
        
            const resultBox =
                document.getElementById(
                    "queryResult"
                );
        
        
            if (!resultBox) {
        
                return;
        
            }
        
        
            // =================================================
            // 沒有資料
            // =================================================
        
            if (
                !Array.isArray(queryResults) ||
                queryResults.length === 0
            ) {
        
                resultBox.innerHTML = `
                    <div class="hint">
                        查無符合條件的報餐資料
                    </div>
                `;
        
                return;
        
            }
        
        
            // =================================================
            // 計算總頁數
            // =================================================
        
            const totalPages =
                Math.ceil(
                    queryResults.length /
                    QUERY_PAGE_SIZE
                );
        
        
            // =================================================
            // 防止頁碼超出範圍
            // =================================================
        
            if (
                queryCurrentPage < 1
            ) {
        
                queryCurrentPage = 1;
        
            }
        
        
            if (
                queryCurrentPage > totalPages
            ) {
        
                queryCurrentPage =
                    totalPages;
        
            }
        
        
            // =================================================
            // 計算目前頁面的資料範圍
            // =================================================
        
            const startIndex =
                (
                    queryCurrentPage - 1
                ) *
                QUERY_PAGE_SIZE;
        
        
            const endIndex =
                Math.min(
                    startIndex +
                    QUERY_PAGE_SIZE,
                    queryResults.length
                );
        
        
            const pageResults =
                queryResults.slice(
                    startIndex,
                    endIndex
                );
        
        
            // =================================================
            // 建立表格
            // =================================================
        
            let html = `
     
        
                <div class="query-table-wrapper">
        
                    <table class="query-table">
        
                        <thead>
        
                            <tr>
        
                                <th>報餐日期</th>
                                <th>工號</th>
                                <th>姓名</th>
                                <th>公司</th>
                                <th>單位</th>
                                <th>餐別</th>
                                <th>葷素別</th>
                                <th>代報人</th>
                                <th>報餐時間</th>
                                <th>狀態</th>
        
                            </tr>
        
                        </thead>
        
                        <tbody>
        
            `;
        
        
            // =================================================
            // 顯示目前頁面的資料
            // =================================================
        
            pageResults.forEach(
                function(item) {
        
                    let statusHtml = "";
        
        
                    // =================================================
                    // J欄 O = 可取消
                    // =================================================
        
                    if (
                        item.status === "O"
                    ) {
        
                        statusHtml = `
        
                            <button
                                type="button"
                                class="cancel-order-btn"
                                onclick="cancelOrder(
                                    '${item.rowNumber}',
                                    '${item.orderDate}',
                                    '${item.employeeId}',
                                    '${item.mealTime}'
                                )"
                            >
                                可取消
                            </button>
        
                        `;
        
                    }
        
        
                    // =================================================
                    // J欄 X = 不可取消
                    // =================================================
        
                    else if (
                        item.status === "X"
                    ) {
        
                        statusHtml = `
        
                            <span
                                class="status-disabled"
                                title="此筆報餐目前不可取消"
                            >
                                不可取消
                            </span>
        
                        `;
        
                    }
        
        
                    // =================================================
                    // 其他狀態
                    // =================================================
        
                    else {
        
                        statusHtml =
                            item.status || "";
        
                    }
        
        
                    html += `
        
                        <tr>
        
                            <td>
                                ${item.orderDate || ""}
                            </td>
        
                            <td>
                                ${item.employeeId || ""}
                            </td>
        
                            <td>
                                ${item.name || ""}
                            </td>
        
                            <td>
                                ${item.company || ""}
                            </td>
        
                            <td>
                                ${item.unit || ""}
                            </td>
        
                            <td>
                                ${item.mealTime || ""}
                            </td>
        
                            <td>
                                ${item.category || ""}
                            </td>
        
                            <td>
                                ${
                                    item.proxyEmployeeId ||
                                    "本人"
                                }
                            </td>
        
                            <td>
                                ${item.orderTime || ""}
                            </td>
        
                            <td>
                                ${statusHtml}
                            </td>
        
                        </tr>
        
                    `;
        
                }
            );
        
        
            html += `
        
                        </tbody>
        
                    </table>
        
                </div>

                <div class="query-result-count">
        
                    共
                    <strong>
                        ${queryResults.length}
                    </strong>
                    筆資料，
                    
                    顯示第
                    <strong>
                        ${startIndex + 1}
                    </strong>
                    -
                    <strong>
                        ${endIndex}
                    </strong>
                    筆
        
                </div>
        
        
                <!-- =================================================
                     分頁按鈕
                ================================================== -->
        
                <div class="query-pagination">
        
                    <button
                        type="button"
                        class="query-page-btn"
                        onclick="changeQueryPage(-1)"
                        ${queryCurrentPage <= 1 ? "disabled" : ""}
                    >
                        ‹ 上一頁
                    </button>
        
        
                    <div class="query-page-info">
        
                        第
                        <strong>
                            ${queryCurrentPage}
                        </strong>
                        /
                        ${totalPages}
                        頁
        
                    </div>
        
        
                    <button
                        type="button"
                        class="query-page-btn"
                        onclick="changeQueryPage(1)"
                        ${
                            queryCurrentPage >= totalPages
                                ? "disabled"
                                : ""
                        }
                    >
                        下一頁 ›
                    </button>
        
                </div>
        
            `;
        
        
            resultBox.innerHTML =
                html;
        
        }


        // =================================================
        // 查詢結果：切換頁面
        // direction = -1 上一頁
        // direction = 1  下一頁
        // =================================================
        
        function changeQueryPage(
            direction
        ) {
        
            const totalPages =
                Math.ceil(
                    queryResults.length /
                    QUERY_PAGE_SIZE
                );
        
        
            const newPage =
                queryCurrentPage +
                direction;
        
        
            // =================================================
            // 防止超出頁數
            // =================================================
        
            if (
                newPage < 1 ||
                newPage > totalPages
            ) {
        
                return;
        
            }
        
        
            // =================================================
            // 更新目前頁碼
            // =================================================
        
            queryCurrentPage =
                newPage;
        
        
            // =================================================
            // 重新顯示
            // =================================================
        
            renderQueryResults();
        
        
            // =================================================
            // 回到查詢結果頂端
            // =================================================
        
            const resultBox =
                document.getElementById(
                    "queryResult"
                );
        
        
            if (resultBox) {
        
                resultBox.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        
            }
        
        }



        
        // =================================================
        // 取消報餐
        // =================================================
        
        async function cancelOrder(
            rowNumber,
            orderDate,
            employeeId,
            mealTime
        ) {
        
            // =================================================
            // 確認取消
            // =================================================
        
            const confirmCancel =
                confirm(
                    "⚠️ 確定要取消這筆報餐嗎？\n\n" +
                    "報餐日期：" +
                    orderDate +
                    "\n" +
                    "工號：" +
                    employeeId +
                    "\n" +
                    "餐別：" +
                    mealTime +
                    "\n\n" +
                    "取消後將無法復原。"
                );
        
        
            // -------------------------------------------------
            // 使用者選擇「取消」
            // -------------------------------------------------
        
            if (!confirmCancel) {
        
                return;
        
            }
        
        
            // =================================================
            // 取得查詢結果區域
            // =================================================
        
            const resultBox =
                document.getElementById(
                    "queryResult"
                );
        
        
            // =================================================
            // 顯示處理中
            // =================================================
        
            resultBox.innerHTML = `
            
                <div class="hint">
                    ⏳ 正在取消報餐，請稍候...
                </div>
            
            `;
        
        
            try {
        
                // =================================================
                // 建立取消 API
                // =================================================
        
            const url =
                GOOGLE_SCRIPT_URL +
                "?action=cancelOrder" +
                "&rowNumber=" +
                encodeURIComponent(
                    rowNumber
                );
        
        
                console.log(
                    "取消報餐 API：",
                    url
                );
        
        
                // =================================================
                // 呼叫 Google Apps Script
                // =================================================
        
                const response =
                    await fetch(
                        url
                    );
        
        
                const result =
                    await response.json();
        
        
                console.log(
                    "取消報餐結果：",
                    result
                );
        
        
                // =================================================
                // 取消失敗
                // =================================================
        
                if (
                    !result.success
                ) {
        
                    resultBox.innerHTML = `
                    
                        <div class="result-fail">
                            ❌ ${
                                result.message ||
                                "取消報餐失敗"
                            }
                        </div>
                    
                    `;
        
                    return;
        
                }
        
        
                // =================================================
                // 取消成功
                // =================================================
        
                alert(
                    "✅ 報餐已成功取消！"
                );
        
        
                // =================================================
                // 重新查詢
                // =================================================
        
                await queryOrders();
        
        
            }
        
        
            catch (error) {
        
                console.error(
                    "取消報餐失敗：",
                    error
                );
        
        
                resultBox.innerHTML = `
                
                    <div class="result-fail">
                        ❌ 取消報餐失敗，請稍後再試。
                    </div>
                
                `;
        
            }
        
        }


        
        // =================================================
        // 菜單
        // =================================================
        
        let menuData = [];
        
        
        // =================================================
        // 載入菜單
        // 每次進入菜單頁面都重新讀取
        // =================================================
        
        async function loadMenu() {
        
            const menuCompany =
                document.getElementById(
                    "menuCompany"
                );
        
            const menuList =
                document.getElementById(
                    "menuList"
                );
        
            const menuStatus =
                document.getElementById(
                    "menuStatus"
                );
        
        
            if (
                !menuCompany ||
                !menuList
            ) {
        
                console.error(
                    "找不到菜單 DOM 元件"
                );
        
                return;
        
            }
        
        
            // =================================================
            // 顯示載入中
            // =================================================
        
            menuCompany.innerText =
                "正在載入菜單...";
        
        
            menuList.innerHTML = `
                <div class="hint">
                    ⏳ 正在讀取...
                </div>
            `;
        
        
            if (menuStatus) {
        
                menuStatus.innerText =
                    "";
        
            }
        
        
            try {
        
                // =================================================
                // 取得菜單
                // =================================================
        
                const response =
                    await fetch(
                        GOOGLE_SCRIPT_URL +
                        "?action=getMenu"
                    );
        
        
                // =================================================
                // HTTP 錯誤
                // =================================================
        
                if (!response.ok) {
        
                    throw new Error(
                        "HTTP " +
                        response.status
                    );
        
                }
        
        
                const result =
                    await response.json();
        
        
                console.log(
                    "菜單資料：",
                    result
                );
        
        
                // =================================================
                // GAS 回傳失敗
                // =================================================
        
                if (
                    !result.success
                ) {
        
                    menuCompany.innerText =
                        "";
        
                    menuList.innerHTML = `
                        <div class="result-fail">
                            ❌ ${
                                result.message ||
                                "菜單讀取失敗"
                            }
                        </div>
                    `;
        
                    return;
        
                }
        
        
                // =================================================
                // 公司名稱
                // =================================================
        
                menuCompany.innerText =
                    result.company ||
                    "";
        
        
                // =================================================
                // 取得
                // =================================================
        
                if (
                    !Array.isArray(
                        result.menus
                    )
                ) {
        
                    throw new Error(
                        "menus 不是陣列"
                    );
        
                }
        
        
                menuData =
                    result.menus;
        
        
                console.log(
                    "menus：",
                    menuData
                );
        
                console.log(
                    "menus 是否為陣列：",
                    Array.isArray(menuData)
                );
        
                console.log(
                    "menus 筆數：",
                    menuData.length
                );
        
        
                // =================================================
                // 沒有菜單
                // =================================================
        
                if (
                    menuData.length === 0
                ) {
        
                    menuList.innerHTML = `
                        <div class="menu-empty">
                            目前沒有菜單資料
                        </div>
                    `;
        
                    return;
        
                }
        
        
                // =================================================
                // 顯示
                // =================================================
        
                renderSevenDayMenu();
        
        
                // =================================================
                // 更新狀態
                // =================================================
        
                if (menuStatus) {
        
                    menuStatus.innerText =
                        "菜單資料已更新";
        
                }
        
            }
        
        
            catch (error) {
        
                console.error(
                    "載入菜單失敗：",
                    error
                );
        
        
                menuCompany.innerText =
                    "";
        
        
                menuList.innerHTML = `
                    <div class="result-fail">
                        ❌ 無法取得菜單資料
                        <br>
                        <small>
                            ${error.message || ""}
                        </small>
                    </div>
                `;
        
            }
        
        }
        
        
        
        // =================================================
        // 顯示
        // =================================================
        
        
        function renderSevenDayMenu() {
        
            const menuList =
                document.getElementById("menuList");
        
        
            if (!menuList) {
        
                console.error(
                    "❌ 找不到 menuList"
                );
        
                return;
        
            }
        
        
            // =================================================
            // 確認是否有資料
            // =================================================
        
            if (
                !Array.isArray(menuData) ||
                menuData.length === 0
            ) {
        
                menuList.innerHTML = `
                    <div class="menu-empty">
                        目前沒有菜單資料
                    </div>
                `;
        
                return;
        
            }
        
        
            // =================================================
            // 找出所有分類
            //
            // 主食
            // 配菜
            // 甜湯
            // 鹹湯
            // 副食
            // =================================================
        
            const categories = [];
        
        
            menuData.forEach(
                function(day) {
        
                    if (
                        !Array.isArray(day.items)
                    ) {
        
                        return;
        
                    }
        
        
                    day.items.forEach(
                        function(item) {
        
                            const category =
                                (
                                    item.category ||
                                    "其他"
                                ).trim();
        
        
                            if (
                                !categories.includes(
                                    category
                                )
                            ) {
        
                                categories.push(
                                    category
                                );
        
                            }
        
                        }
                    );
        
                }
            );
        
        
            // =================================================
            // 建立表格
            // =================================================
        
            let html = `
        
                <table class="menu-table">
        
                    <thead>
        
                        <tr>
        
                            <th class="menu-category-column">
                                餐點
                            </th>
        
            `;
        
        
            // =================================================
            // 七天日期
            // =================================================
        
            menuData.forEach(
                function(day) {
        
                    html += `
        
                        <th>
        
                            <div class="menu-table-date">
                                ${day.date || ""}
                            </div>
        
                            <div class="menu-table-week">
                                ${day.week || ""}
                            </div>
        
                        </th>
        
                    `;
        
                }
            );
        
        
            html += `
        
                        </tr>
        
                    </thead>
        
                    <tbody>
        
            `;
        
        
            // =================================================
            // 每一個分類
            // =================================================
        
            categories.forEach(
                function(category) {
        
        
                    // =================================================
                    // 找出「所有天數」中，
                    // 這個分類最多有幾筆
                    //
                    // 例如：
                    //
                    // 主食：
                    // 星期一 2筆
                    // 星期二 1筆
                    // 星期三 2筆
                    //
                    // 那這一列就會以最多筆數來顯示
                    // =================================================
        
                    let maxItemCount = 1;
        
        
                    menuData.forEach(
                        function(day) {
        
                            if (
                                !Array.isArray(day.items)
                            ) {
        
                                return;
        
                            }
        
        
                            const items =
                                day.items.filter(
                                    function(item) {
        
                                        return (
                                            (
                                                item.category ||
                                                "其他"
                                            ).trim() ===
                                            category
                                        );
        
                                    }
                                );
        
        
                            if (
                                items.length >
                                maxItemCount
                            ) {
        
                                maxItemCount =
                                    items.length;
        
                            }
        
                        }
                    );
        
        
                    // =================================================
                    // 建立分類列
                    //
                    // 每一個分類可能需要多列
                    // =================================================
        
                    for (
                        let rowIndex = 0;
                        rowIndex < maxItemCount;
                        rowIndex++
                    ) {
        
        
                        html += `
        
                            <tr>
        
                        `;
        
        
                        // =================================================
                        // 左側分類
                        //
                        // 只有第一列顯示分類名稱
                        // =================================================
        
                        if (
                            rowIndex === 0
                        ) {
        
                            html += `
        
                                <td
                                    class="menu-row-category"
                                    rowspan="${maxItemCount}"
                                >
                                    ${category}
                                </td>
        
                            `;
        
                        }
        
        
                        // =================================================
                        // 每一天
                        // =================================================
        
                        menuData.forEach(
                            function(day) {
        
        
                                let foodName = "";
        
        
                                if (
                                    Array.isArray(day.items)
                                ) {
        
                                    const items =
                                        day.items.filter(
                                            function(item) {
        
                                                return (
                                                    (
                                                        item.category ||
                                                        "其他"
                                                    ).trim() ===
                                                    category
                                                );
        
                                            }
                                        );
        
        
                                    // -----------------------------------------
                                    // 取得目前這一列的菜色
                                    // -----------------------------------------
        
                                    if (
                                        items[rowIndex]
                                    ) {
        
                                        foodName =
                                            items[rowIndex].name ||
                                            "";
        
                                    }
        
                                }
        
        
                                // =================================================
                                // 顯示菜名
                                // =================================================
        
                                if (
                                    foodName &&
                                    foodName !== "-"
                                ) {
        
                                    html += `
        
                                        <td>
        
                                            <div class="menu-food-name">
                                                ${foodName}
                                            </div>
        
                                        </td>
        
                                    `;
        
                                }
        
                                else {
        
                                    html += `
        
                                        <td>
        
                                            <div class="menu-food-empty">
                                                ${
                                                    foodName === "-"
                                                        ? "-"
                                                        : ""
                                                }
                                            </div>
        
                                        </td>
        
                                    `;
        
                                }
        
                            }
                        );
        
        
                        html += `
        
                            </tr>
        
                        `;
        
                    }
        
                }
            );
        
        
            // =================================================
            // 結束表格
            // =================================================
        
            html += `
        
                    </tbody>
        
                </table>
        
            `;
        
        
            menuList.innerHTML =
                html;
        
        
            console.log(
                "✅ 七天菜單表格已完成渲染"
            );
        
        }

        // =================================================
        // 餐點統計
        // 單日統計
        // =================================================
        
        async function getMealStatistics() {
        
            const dateInput =
                document.getElementById(
                    "statisticsDate"
                );
        
            const resultBox =
                document.getElementById(
                    "mealStatisticsResult"
                );
        
            const statusBox =
                document.getElementById(
                    "mealStatisticsStatus"
                );
        
        
            if (
                !dateInput ||
                !resultBox
            ) {
        
                console.error(
                    "找不到餐點統計 DOM"
                );
        
                return;
        
            }
        
        
            const statisticsDate =
                dateInput.value;
        
        
            // =================================================
            // 日期檢查
            // =================================================
        
            if (!statisticsDate) {
        
                if (statusBox) {
        
                    statusBox.innerHTML = `
                        <div class="result-fail">
                            ❌ 請選擇統計日期
                        </div>
                    `;
        
                }
        
                return;
        
            }
        
        
            // =================================================
            // 顯示載入中
            // =================================================
        
            resultBox.innerHTML = `
                <div class="meal-stat-empty">
                    ⏳ 正在統計 ${statisticsDate} 的餐點資料...
                </div>
            `;
        
        
            if (statusBox) {
        
                statusBox.innerHTML = "";
        
            }
        
        
            try {
        
                // =================================================
                // 建立 API
                // =================================================
        
                const url =
                    GOOGLE_SCRIPT_URL +
                    "?action=getMealStatistics" +
                    "&date=" +
                    encodeURIComponent(
                        statisticsDate
                    );
        
        
                console.log(
                    "餐點統計 API：",
                    url
                );
        
        
                // =================================================
                // 呼叫 GAS
                // =================================================
        
                const response =
                    await fetch(
                        url
                    );
        
        
                if (!response.ok) {
        
                    throw new Error(
                        "HTTP " +
                        response.status
                    );
        
                }
        
        
                const result =
                    await response.json();
        
        
                console.log(
                    "餐點統計結果：",
                    result
                );
        
        
                // =================================================
                // GAS 失敗
                // =================================================
        
                if (
                    !result.success
                ) {
        
                    resultBox.innerHTML = `
                        <div class="meal-stat-empty">
                            ❌ ${
                                result.message ||
                                "餐點統計失敗"
                            }
                        </div>
                    `;
        
                    return;
        
                }
        
        
                // =================================================
                // 沒有資料
                // =================================================
        
                if (
                    !Array.isArray(
                        result.results
                    ) ||
                    result.results.length === 0
                ) {
        
                    resultBox.innerHTML = `
                        <div class="meal-stat-empty">
                            📭 ${statisticsDate}
                            查無餐點統計資料
                        </div>
                    `;
        
                    if (statusBox) {
        
                        statusBox.innerHTML = `
                            <div class="hint">
                                📅 統計日期：${statisticsDate}
                            </div>
                        `;
        
                    }
        
                    return;
        
                }
        
        
                // =================================================
                // 建立公司 CARD
                // =================================================
        
                let html = "";
        
        
                result.results.forEach(
                    function(item) {
        
                        html +=
                            createCompanyStatisticCard(
                                item
                            );
        
                    }
                );
        
        
                // =================================================
                // 全部合計
                // =================================================
        
                if (
                    result.total
                ) {
        
                    html +=
                        createTotalStatisticCard(
                            result.total
                        );
        
                }
        
        
                resultBox.innerHTML =
                    html;
        
        
                // =================================================
                // 狀態
                // =================================================
        
                if (statusBox) {
        
                    statusBox.innerHTML = `
                        <div class="hint">                          　
                            🏢 共
                            <strong>${result.companyCount || result.results.length}</strong>
                            間公司
                        </div>
                    `;
        
                }
        
            }
        
        
            catch (error) {
        
                console.error(
                    "餐點統計失敗：",
                    error
                );
        
        
                resultBox.innerHTML = `
                    <div class="meal-stat-empty">
                        ❌ 無法取得餐點統計
                        <br>
                        <small>
                            ${
                                error.message ||
                                ""
                            }
                        </small>
                    </div>
                `;
        
            }
        
        }
        
        
        
        // =================================================
        // 公司統計 CARD
        // =================================================
        
        function createCompanyStatisticCard(
            item
        ) {
        
            const company =
                escapeHtml(
                    item.company || "未設定公司"
                );
        
        
            return `
        
                <div class="meal-stat-card">
        
                    <!-- 公司名稱 -->
        
                    <div class="meal-stat-company">
        
                        <span>
                            ${company}
                        </span>
        
                    </div>
        
        
                    <!-- ============================= -->
                    <!-- 午餐 -->
                    <!-- ============================= -->
        
                    <div class="meal-stat-section">
        
                        <div class="meal-stat-title lunch-title">
        
                            <span>🍱</span>
        
                            <span>午餐</span>
        
                        </div>
        
        
                        <div class="meal-stat-row">
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    葷
                                </div>
        
                                <div class="meal-stat-item-value meat">
                                    ${item.lunchMeat || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    素
                                </div>
        
                                <div class="meal-stat-item-value vegetarian">
                                    ${item.lunchVegetarian || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item total">
        
                                <div class="meal-stat-item-label">
                                    合計
                                </div>
        
                                <div class="meal-stat-item-value">
                                    ${item.lunchTotal || 0}
                                </div>
        
                            </div>
        
        
                        </div>
        
                    </div>
        
        
        
                    <!-- ============================= -->
                    <!-- 晚餐 -->
                    <!-- ============================= -->
        
                    <div class="meal-stat-section">
        
                        <div class="meal-stat-title dinner-title">
        
                            <span>🍽️</span>
        
                            <span>晚餐</span>
        
                        </div>
        
        
                        <div class="meal-stat-row">
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    葷
                                </div>
        
                                <div class="meal-stat-item-value meat">
                                    ${item.dinnerMeat || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    素
                                </div>
        
                                <div class="meal-stat-item-value vegetarian">
                                    ${item.dinnerVegetarian || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item total">
        
                                <div class="meal-stat-item-label">
                                    合計
                                </div>
        
                                <div class="meal-stat-item-value">
                                    ${item.dinnerTotal || 0}
                                </div>
        
                            </div>
        
        
                        </div>
        
                    </div>
        
        
        
                    <!-- ============================= -->
                    <!-- 公司總計 -->
                    <!-- ============================= -->
        
                    <div class="meal-stat-grand-total">
        
                        <div class="meal-stat-grand-total-label">
        
                            報餐數
        
                        </div>
        
                        <div class="meal-stat-grand-total-value">
        
                            ${item.total || 0}
        
                            <span class="meal-stat-unit">
                                份
                            </span>
        
                        </div>
        
                    </div>
        
                </div>
        
            `;
        
        }
        
        
        
        // =================================================
        // 全部合計 CARD
        // =================================================
        
        function createTotalStatisticCard(
            item
        ) {
        
            return `
        
                <div class="meal-stat-card total-card">
        
                    <!-- 標題 -->
        
                    <div class="meal-stat-company total-company">
        
                        <span>
                            📊 全部公司合計
                        </span>
        
                    </div>
        
        
                    <!-- ============================= -->
                    <!-- 午餐 -->
                    <!-- ============================= -->
        
                    <div class="meal-stat-section">
        
                        <div class="meal-stat-title lunch-title">
        
                            <span>🍱</span>
        
                            <span>午餐</span>
        
                        </div>
        
        
                        <div class="meal-stat-row">
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    葷
                                </div>
        
                                <div class="meal-stat-item-value meat">
                                    ${item.lunchMeat || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    素
                                </div>
        
                                <div class="meal-stat-item-value vegetarian">
                                    ${item.lunchVegetarian || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item total">
        
                                <div class="meal-stat-item-label">
                                    合計
                                </div>
        
                                <div class="meal-stat-item-value">
                                    ${item.lunchTotal || 0}
                                </div>
        
                            </div>
        
        
                        </div>
        
                    </div>
        
        
        
                    <!-- ============================= -->
                    <!-- 晚餐 -->
                    <!-- ============================= -->
        
                    <div class="meal-stat-section">
        
                        <div class="meal-stat-title dinner-title">
        
                            <span>🍽️</span>
        
                            <span>晚餐</span>
        
                        </div>
        
        
                        <div class="meal-stat-row">
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    葷
                                </div>
        
                                <div class="meal-stat-item-value meat">
                                    ${item.dinnerMeat || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item">
        
                                <div class="meal-stat-item-label">
                                    素
                                </div>
        
                                <div class="meal-stat-item-value vegetarian">
                                    ${item.dinnerVegetarian || 0}
                                </div>
        
                            </div>
        
        
                            <div class="meal-stat-item total">
        
                                <div class="meal-stat-item-label">
                                    合計
                                </div>
        
                                <div class="meal-stat-item-value">
                                    ${item.dinnerTotal || 0}
                                </div>
        
                            </div>
        
        
                        </div>
        
                    </div>
        
        
        
                    <!-- ============================= -->
                    <!-- 全部總計 -->
                    <!-- ============================= -->
        
                    <div class="meal-stat-grand-total">
        
                        <div class="meal-stat-grand-total-label">
        
                            全部公司總報餐數
        
                        </div>
        
                        <div class="meal-stat-grand-total-value">
        
                            ${item.total || 0}
        
                            <span class="meal-stat-unit">
                                份
                            </span>
        
                        </div>
        
                    </div>
        
                </div>
        
            `;
        
        }
        
        
        
        // =================================================
        // HTML 安全處理
        // =================================================
        
        function escapeHtml(
            value
        ) {
        
            return String(
                value || ""
            )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
        
        }






    </script>
