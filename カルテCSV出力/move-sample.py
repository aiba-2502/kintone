import os
import shutil

# ダウンロードフォルダのパス（Windowsの場合）
download_folder = os.path.join(os.environ['USERPROFILE'], 'Downloads')

# 移動先のフォルダ
target_folder = r"D:\\kintone"

# 対象ファイルの条件
file_keyword = "export"
file_extension = ".csv"

# 移動先フォルダが存在しない場合は作成
if not os.path.exists(target_folder):
    os.makedirs(target_folder)

# ダウンロードフォルダ内のファイルを確認
for file_name in os.listdir(download_folder):
    if file_keyword in file_name and file_name.lower().endswith(file_extension):
        # ファイルのフルパス
        source_path = os.path.join(download_folder, file_name)
        destination_path = os.path.join(target_folder, file_name)

        # ファイルを移動
        try:
            shutil.move(source_path, destination_path)
            print(f"Moved: {file_name} -> {destination_path}")
        except Exception as e:
            print(f"Error moving {file_name}: {e}")

print("Process completed.")
