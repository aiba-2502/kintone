(function() {
    'use strict';

    // 対象画面のイベントに処理をバインド
    kintone.events.on('app.record.create.show', function(event) {
        // ボタンを作成してスペースに追加
        var spaceElement = kintone.app.record.getSpaceElement('csv_output');
        if (!spaceElement) return;

        var button = document.createElement('button');
        button.textContent = 'CSV出力※作成中';
        button.id = 'csv-output-button';
        spaceElement.appendChild(button);

        // ボタンクリック時の処理
        button.addEventListener('click', function() {
            // 診療領収書（アプリID: 64）と患者マスタ（アプリID: 9）からデータを取得
            Promise.all([
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
                    app: 64,
                    fields: ['宛先', '発行日', '領収金額', '領収書番号', '消費税']
                }),
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
                    app: 9,
                    fields: ['患者電話番号']
                })
            ]).then(function([receiptData, patientData]) {
                // CSVデータ作成
                var csvData = '宛先,患者電話番号,発行日,領収金額,領収書番号,消費税\n';

                receiptData.records.forEach(function(receiptRecord, index) {
                    var patientRecord = patientData.records[index] || {}; // 患者データの対応付け（単純な例）

                    csvData += [
                        receiptRecord['宛先'] ? receiptRecord['宛先'].value : '',
                        patientRecord['患者電話番号'] ? patientRecord['患者電話番号'].value : '',
                        receiptRecord['発行日'] ? receiptRecord['発行日'].value : '',
                        receiptRecord['領収金額'] ? receiptRecord['領収金額'].value : '',
                        receiptRecord['領収書番号'] ? receiptRecord['領収書番号'].value : '',
                        receiptRecord['消費税'] ? Math.floor(parseFloat(receiptRecord['消費税'].value)) : ''
                    ].join(',') + '\n';
                });

                // CSVファイルをダウンロード
                var blob = new Blob([csvData], { type: 'text/csv' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'export.csv';
                a.click();
                URL.revokeObjectURL(url);
            }).catch(function(error) {
                console.error('データ取得エラー:', error);
                alert('データの取得中にエラーが発生しました。');
            });
        });

        return event;
    });
})();