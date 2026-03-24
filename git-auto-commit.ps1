param (
    [string]$message = "auto commit"
)

$git = 'C:\Program Files\Git\bin\git.exe'

Write-Host "# 1) git status"
& $git status

Write-Host "# 2) git add ."
& $git add .

Write-Host "# 3) git commit -m '$message'"
$commitResult = & $git commit -m "$message" 2>&1
Write-Host $commitResult

if ($LASTEXITCODE -ne 0) {
    if ($commitResult -match 'nothing to commit') {
        Write-Host "=> 커밋할 변경이 없습니다. push로 넘어갑니다."
    } else {
        Write-Host "=> 커밋 실패, 종료합니다."
        exit $LASTEXITCODE
    }
}

Write-Host "# 4) git push"
& $git push -u origin main

Write-Host "완료: 자동 커밋+푸시 실행됨."