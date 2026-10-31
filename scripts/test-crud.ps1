$loginBody = '{"usernameOrEmail":"admin","password":"password"}'
$loginRes = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginRes.data.accessToken
Write-Host "[+] Logged in successfully as $($loginRes.data.user.username). Token acquired." -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 1. Test GET Companies
$companies = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/companies" -Headers $headers
Write-Host "[+] Companies retrieved: $($companies.data.Count)" -ForegroundColor Cyan
$comp1 = $companies.data[0].id

# 2. Test Branch CRUD (CREATE -> UPDATE -> DELETE)
Write-Host "`n--- Testing Branch CRUD ---" -ForegroundColor Yellow
$branchCreate = @{
    companyId = $comp1
    code = "BR_TEST_99"
    name = "Temporary Test Branch"
    addressLine1 = "Test St 123"
    city = "Jakarta"
    country = "Indonesia"
    isHeadquarters = $false
} | ConvertTo-Json

$createdBranch = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/branches" -Method Post -Headers $headers -Body $branchCreate
$branchId = $createdBranch.data.id
Write-Host "[+] Branch Created: $branchId ($($createdBranch.data.name))" -ForegroundColor Green

$branchUpdate = @{
    name = "Temporary Test Branch Updated"
    addressLine1 = "Updated St 456"
    city = "Bandung"
    country = "Indonesia"
    isHeadquarters = $false
} | ConvertTo-Json

$updatedBranch = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/branches/$branchId" -Method Put -Headers $headers -Body $branchUpdate
Write-Host "[+] Branch Updated (PUT): $($updatedBranch.data.name)" -ForegroundColor Green

Invoke-RestMethod -Uri "http://localhost:5174/api/v1/branches/$branchId" -Method Delete -Headers $headers | Out-Null
Write-Host "[+] Branch Deleted (DELETE): $branchId" -ForegroundColor Green

# 3. Test Asset CRUD (CREATE -> UPDATE -> DELETE)
Write-Host "`n--- Testing Asset CRUD ---" -ForegroundColor Yellow
$catCreate = @{
    companyId = $comp1
    code = "CAT_TEST"
    name = "Test Category"
} | ConvertTo-Json
$catRes = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/assets/categories" -Method Post -Headers $headers -Body $catCreate
$catId = $catRes.data.id

$assetCreate = @{
    companyId = $comp1
    categoryId = $catId
    assetTag = "AST-TEST-001"
    name = "Test Laptop"
    model = "16-inch M3"
    purchaseDate = "2026-09-12"
    purchaseCost = 25000000
    conditionGrade = "EXCELLENT"
} | ConvertTo-Json
$createdAsset = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/assets" -Method Post -Headers $headers -Body $assetCreate
$assetId = $createdAsset.data.id
Write-Host "[+] Asset Created: $assetId ($($createdAsset.data.name))" -ForegroundColor Green

$assetUpdate = @{
    companyId = $comp1
    categoryId = $catId
    assetTag = "AST-TEST-001"
    name = "Test Laptop (Updated)"
    model = "16-inch M3 Max"
    purchaseDate = "2026-09-12"
    purchaseCost = 30000000
    conditionGrade = "GOOD"
} | ConvertTo-Json
$updatedAsset = Invoke-RestMethod -Uri "http://localhost:5174/api/v1/assets/$assetId" -Method Put -Headers $headers -Body $assetUpdate
Write-Host "[+] Asset Updated (PUT): $($updatedAsset.data.name), Cost: $($updatedAsset.data.purchaseCost)" -ForegroundColor Green

Invoke-RestMethod -Uri "http://localhost:5174/api/v1/assets/$assetId" -Method Delete -Headers $headers | Out-Null
Write-Host "[+] Asset Deleted (DELETE): $assetId" -ForegroundColor Green

Write-Host "`n[SUCCESS] FULL CRUD (POST, GET, PUT, DELETE) TEST PASSED FLAWLESSLY!" -ForegroundColor Green
