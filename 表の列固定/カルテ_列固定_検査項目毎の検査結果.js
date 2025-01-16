(function () {
    "use strict";

    /** 初期設定 */
    const fieldSettings = {
        '検査有無': { showValue: '有', fields: ['有', '無'], clearOn: false },
    };

    /** 列幅の設定 */
    const columnWidths = [159, 129, 268]; // 各列の幅を指定

    /** テーブルの列を固定する関数
     * @param {HTMLElement} subtable - 対象のサブテーブル要素
     */
    function fixTableColumns(subtable) {
        if (!subtable) {
            console.warn('対象のテーブルが見つかりませんでした。');
            return;
        }

        // 固定列のヘッダー処理
        const headers = subtable.querySelectorAll('.subtable-header-gaia th');
        headers.forEach((header, index) => {
            if (index < columnWidths.length) {
                header.style.position = 'sticky';
                header.style.left = `${columnWidths.slice(0, index).reduce((acc, width) => acc + width, 0)}px`;
                header.style.zIndex = '2';
            }
        });

        // 固定列のデータ部分の処理
        const rows = subtable.querySelectorAll('.subtable-gaia tbody tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (index < columnWidths.length) {
                    cell.style.position = 'sticky';
                    cell.style.left = `${columnWidths.slice(0, index).reduce((acc, width) => acc + width, 0)}px`;
                    cell.style.zIndex = '1';
                    cell.style.backgroundColor = '#F5F5F5'; // 背景をグレーに設定
                }
            });
        });
    }

    /** サブテーブルの行が追加された際の処理 */
    function onRowAdded(event, subtableSelector) {
        const subtable = document.querySelector(subtableSelector);
        if (subtable) {
            fixTableColumns(subtable);
        }
    }

    /** イベントハンドラの登録 */
    kintone.events.on([
        'app.record.create.show',
        'app.record.edit.show'
    ], function (event) {
        const subtableSelector = '.subtable-gaia.subtable-5734956.edit-subtable-gaia';
        const subtable = document.querySelector(subtableSelector);
        fixTableColumns(subtable);

        // サブテーブルの行追加イベントの監視
        const tableBody = subtable.querySelector('tbody');
        const observer = new MutationObserver(() => {
            onRowAdded(event, subtableSelector);
        });
        observer.observe(tableBody, { childList: true });
    });
})();
