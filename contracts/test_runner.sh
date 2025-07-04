#!/bin/bash

# IMMO Test Runner Script
echo "🧪 Running IMMO Comprehensive Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if forge is installed
if ! command -v forge &> /dev/null; then
    print_error "Foundry's forge not found. Please install Foundry first."
    exit 1
fi

print_status "Starting test suite..."

# Clean and build
print_status "Building contracts..."
forge build
if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi
print_success "Build completed"

# Run unit tests
echo ""
print_status "Running Unit Tests"
echo "==================="

print_status "Testing ERC20Token..."
forge test --match-path "test/unit/ERC20Token.t.sol" -vv
if [ $? -eq 0 ]; then
    print_success "ERC20Token tests passed"
else
    print_error "ERC20Token tests failed"
fi

print_status "Testing ProjectFactory..."
forge test --match-path "test/unit/ProjectFactory.t.sol" -vv
if [ $? -eq 0 ]; then
    print_success "ProjectFactory tests passed"
else
    print_error "ProjectFactory tests failed"
fi

print_status "Testing DirectPool..."
forge test --match-path "test/unit/DirectPool.t.sol" -vv
if [ $? -eq 0 ]; then
    print_success "DirectPool tests passed"
else
    print_error "DirectPool tests failed"
fi

print_status "Testing BondingCurve..."
forge test --match-path "test/unit/BondingCurve.t.sol" -vv
if [ $? -eq 0 ]; then
    print_success "BondingCurve tests passed"
else
    print_error "BondingCurve tests failed"
fi

# Run integration tests
echo ""
print_status "Running Integration Tests"
echo "=========================="

print_status "Testing Happy Path scenarios..."
forge test --match-path "test/integration/HappyPath.t.sol" -vv
if [ $? -eq 0 ]; then
    print_success "Happy Path tests passed"
else
    print_error "Happy Path tests failed"
fi

print_status "Testing Edge Cases..."
forge test --match-path "test/integration/EdgeCases.t.sol" -vv
if [ $? -eq 0 ]; then
    print_success "Edge Cases tests passed"
else
    print_error "Edge Cases tests failed"
fi

# Run all tests with coverage
echo ""
print_status "Running Full Test Suite with Coverage"
echo "======================================"

forge test --gas-report
if [ $? -eq 0 ]; then
    print_success "All tests passed!"
else
    print_error "Some tests failed!"
fi

# Generate coverage report
print_status "Generating coverage report..."
forge coverage --report lcov
if [ $? -eq 0 ]; then
    print_success "Coverage report generated: lcov.info"
else
    print_warning "Coverage report generation failed"
fi

# Run specific happy path scenario
echo ""
print_status "Running Complete Happy Path Demo"
echo "================================="

forge test --match-test "test_CompleteDirectPoolFlow" -vvv
forge test --match-test "test_CompleteBondingCurveToDirectPoolFlow" -vvv

print_success "Test suite completed!"
echo ""
echo "📊 Test Summary:"
echo "- Unit tests: ERC20Token, ProjectFactory, DirectPool, BondingCurve"
echo "- Integration tests: Happy Path, Edge Cases"
echo "- Coverage report: lcov.info (if generated)"
echo ""
echo "🎯 Next steps:"
echo "1. Deploy contracts to Arbitrum Sepolia"
echo "2. Update frontend contract addresses"
echo "3. Run frontend with mock data"
echo "4. Test end-to-end flows"