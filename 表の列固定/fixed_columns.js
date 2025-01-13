(() => {
    'use strict';

    // レコード作成画面と編集画面に適用
    kintone.events.on(["app.record.create.show", "app.record.edit.show"], function () {
        // テーブル要素を取得
        const subtable = document.querySelector('.subtable-gaia');

        // テーブルが存在しない場合は処理を終了
        if (!subtable) {
            console.warn('対象のテーブルが見つかりませんでした。');
            return;
        }

        // 固定列のヘッダー処理
        const headers = subtable.querySelectorAll('.subtable-header-gaia th');
        headers.forEach((header, index) => {
            if (index < 3) { // 1列目から3列目を固定
                header.style.position = 'sticky'; // スクロール時に固定
                header.style.left = `${index * 193}px`; // 列の位置を計算
                //header.style.backgroundColor = '#FFF'; // 背景色を白に設定
                header.style.zIndex = '2'; // ヘッダーを前面に表示
            }
        });

        // 固定列のデータ部分の処理
        const rows = subtable.querySelectorAll('.subtable-gaia tbody tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (index < 3) { // 1列目から3列目を固定
                    cell.style.position = 'sticky'; // スクロール時に固定
                    cell.style.left = `${index * 193}px`; // 列の位置を計算
                    //cell.style.backgroundColor = '#FFF'; // 背景色を白に設定
                    cell.style.zIndex = '1'; // データセルを背景より前面に表示
                }
            });
        });
    });
})();
