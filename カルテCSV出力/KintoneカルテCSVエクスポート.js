(() => {
    'use strict';

    // CSVダウンロードのメイン処理
    const dlCsv = async () => {

        // CSVヘッダーの生成
        const setHeaderData = () => {
            return HEADER.map(escapeCsvValue).join(',') + '\r\n';
        };

        // レコードデータをCSV形式に変換
        const recordToCsvData = records => {
            return records.map(record => {
                return HEADER.map(fieldCode => {
                    const value = record[fieldCode]?.value || '';
                    return escapeCsvValue(value);
                }).join(',');
            }).join('\r\n') + '\r\n';
        };

        // CSV用に値をエスケープ
        const escapeCsvValue = value => {
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`; // ダブルクオートをエスケープ
            }
            if (typeof value === 'object') {
                return JSON.stringify(value); // オブジェクトを文字列化
            }
            return value;
        };

        // CSV用のフィールドコード
        const HEADER = ['日付', '作成者', '文字列__複数行', '文字列__複数行__0'];

        // レコードデータの取得
        const param_get = {
            app: kintone.app.getId(),
        };
        const obj_get = await kintone.api('/k/v1/records', 'GET', param_get);
        const targetRecords = obj_get.records;

        // レコードが存在すればCSVを生成
        if (targetRecords.length > 0) {
            const csvContent = setHeaderData() + recordToCsvData(targetRecords);

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            // CSVファイルをダウンロード
            const a = document.createElement('a');
            a.href = url;
            a.download = 'export.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    };

    // レコード作成・編集画面表示時にボタンを追加
    kintone.events.on([
        'app.record.create.show',
        'mobile.app.record.create.show',
        'app.record.edit.show',
        'mobile.app.record.edit.show'
    ], event => {
        // フィールドスペース要素を取得
        const spaceElement = kintone.app.record.getSpaceElement('CSV_output');

        if (spaceElement) {
            // ボタンを作成
            const btn = document.createElement('button');
            btn.textContent = 'CSV出力';
            btn.style.margin = '10px';
            btn.style.padding = '5px';
            btn.style.borderRadius = '10px';
            btn.style.cursor = 'pointer';
            btn.onclick = dlCsv;

            // スペース要素にボタンを追加
            spaceElement.appendChild(btn);
        } else {
            console.warn('指定したフィールドコードが見つかりませんでした: CSV_output');
        }

        return event;
    });
})();
