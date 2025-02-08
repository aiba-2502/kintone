(function() {
    'use strict';

    // フィールドコードの定義
    const PAYMENT_METHOD_FIELD = '支払い方法';
    const PHONE_FIELD = '患者電話番号'; // 追加: 患者電話番号
    const SPACE_FIELD = 'send_to_endpoint';
    const ENDPOINT_URL = 'http://localhost:3000/api/data';

    const PATIENT_INFO_FIELDS = {
        'レコード番号': 'レコード番号',
        '患者氏名': '氏名_漢字_',
        '患者氏名カナ': '氏名_カナ_',
        '患者生年月日': '患者生年月日',
        '患者電話番号': '患者電話番号',
        '年齢': '年齢',
        '性別': '患者性別',
    };

    const FIELD_CODES = [
        '患者電話番号',
        '診療費税込',
        '検査キット金額合計税込',
        '薬金額合計税込',
        '合計金額税込',
        '合計金額税込加算減算後'
    ];

    // `/k/9` から患者情報を取得する関数
    async function fetchPatientInfo(phoneNumber) {
        if (!phoneNumber) {
            console.warn('患者電話番号が空です');
            return null;
        }

        const query = `患者電話番号 = "${phoneNumber}"`;
        const params = {
            app: 9, // `/k/9` のアプリID
            query: query
        };

        try {
            const response = await kintone.api('/k/v1/records', 'GET', params);
            if (response.records.length > 0) {
                const patientRecord = response.records[0]; // 最初に一致したレコードを取得
                const patientData = {};
                
                // 取得したレコードから必要なフィールドを抽出
                Object.keys(PATIENT_INFO_FIELDS).forEach(field => {
                    patientData[field] = patientRecord[PATIENT_INFO_FIELDS[field]]?.value || '';
                });

                return patientData;
            } else {
                console.warn('一致する患者情報が見つかりませんでした');
                return null;
            }
        } catch (error) {
            console.error('患者情報の取得エラー:', error);
            return null;
        }
    }

    // ボタン作成関数
    function createButton(record) {
        const button = document.createElement('button');
        button.id = 'sendButton';
        button.innerText = '送信';
        button.style.margin = '10px';
        
        button.addEventListener('click', async function() {
            let data = {};

            // 患者電話番号を取得し、/k/9 から情報を取得
            const phoneNumber = record[PHONE_FIELD]?.value;
            const patientInfo = await fetchPatientInfo(phoneNumber);

            // **患者情報を先に追加**
            if (patientInfo) {
                Object.keys(patientInfo).forEach(field => {
                    data[field] = patientInfo[field];
                });
            }

            // **その後、現在のレコード情報を追加**
            FIELD_CODES.forEach(field => {
                data[field] = record[field]?.value || '';
            });

            // データ送信
            fetch(ENDPOINT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error ' + response.status);
                }
                return response.json();
            })
            .then(responseData => {
                console.log('送信成功:', responseData);
                alert('データを送信しました');
            })
            .catch(error => {
                console.error('送信エラー:', error);
                alert('データ送信に失敗しました');
            });
        });

        return button;
    }

    // イベント処理関数
    function handlePaymentMethodChange(event) {
        const record = event.record;
        const paymentMethod = record[PAYMENT_METHOD_FIELD]?.value;
        const spaceElement = kintone.app.record.getSpaceElement(SPACE_FIELD);

        if (spaceElement) {
            // 既存のボタンを削除
            const existingButton = document.getElementById('sendButton');
            if (existingButton) {
                existingButton.remove();
            }

            // 「現地（精算機）」が選択された場合のみボタンを表示
            if (paymentMethod === '現地（精算機）') {
                spaceElement.appendChild(createButton(record));
            }
        }
        return event;
    }

    // イベント登録
    kintone.events.on([
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.detail.show',
        'app.record.create.change.' + PAYMENT_METHOD_FIELD,
        'app.record.edit.change.' + PAYMENT_METHOD_FIELD
    ], handlePaymentMethodChange);
})();
