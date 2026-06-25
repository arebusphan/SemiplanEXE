$content = Get-Content -Path "SemiplanService\ScheduleService.cs" -Raw
$newMethod = Get-Content -Path "temp_method.cs" -Raw

$startIndex = $content.IndexOf("    public async Task<List<ScheduleResponseDto>> GenerateScheduleAsync(GenerateScheduleDto dto)")
$endIndex = $content.IndexOf("    public async Task<string> GenerateStudyContentAsync(int scheduleId)")

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    $finalContent = $before + $newMethod + "`r`n" + $after
    Set-Content -Path "SemiplanService\ScheduleService.cs" -Value $finalContent -NoNewline
    Write-Host "Replaced successfully!"
} else {
    Write-Host "Could not find bounds!"
}
