# SeatSelector Test Suite

This directory contains comprehensive production-grade tests for the SeatSelector component. The tests are organized by concern and cover every aspect of the component's functionality.

## Test Structure

### Unit Tests (Modular Hooks)
- **`hooks/useBookingData.int.spec.ts`** - Data fetching, caching, and SWR integration
- **`hooks/useSeatAnimations.int.spec.ts`** - Animation state management and timeouts
- **`hooks/useSeatFormState.int.spec.ts`** - PayloadCMS form integration and state persistence
- **`hooks/useSeatSelector.int.spec.ts`** - Main hook orchestration and integration

### Utility Tests
- **`lib/seatCalculations.int.spec.ts`** - Pure function tests for seat calculations, grid dimensions, and booking processing

### Component Tests
- **`components/SeatCell.int.spec.ts`** - Individual seat cell rendering, interactions, and accessibility
- **`components/Legend.int.spec.ts`** - Status legend rendering and internationalization

### Integration Tests
- **`SeatSelector.int.spec.ts`** - Full component integration, user interactions, and state management
- **`SeatSelector.accessibility.int.spec.ts`** - WCAG 2.1 compliance, ARIA attributes, and screen reader support
- **`SeatSelector.performance.int.spec.ts`** - Rendering performance, memory usage, and scalability
- **`SeatSelector.visual.int.spec.ts`** - CSS classes, styling, animations, and visual regression

## Test Coverage Areas

### Functional Testing ✅
- [x] Seat selection/deselection logic
- [x] Status calculations (available, booked, unpaid, selected, currentTicket)
- [x] Grid dimension calculations
- [x] Booking data processing
- [x] Expired ticket detection
- [x] Form state management
- [x] PayloadCMS integration

### Visual Testing ✅
- [x] CSS class applications
- [x] Grid layout positioning
- [x] Icon rendering (Armchair, Ticket, Clock)
- [x] Animation states
- [x] Loading states and shimmer effects
- [x] Expired indicator positioning
- [x] Virtual grid for large datasets
- [x] Responsive behavior

### Performance Testing ✅
- [x] Rendering speed benchmarks
- [x] Memory leak detection
- [x] Large dataset handling (500+ seats)
- [x] Virtualization efficiency
- [x] Concurrent update handling
- [x] Animation performance
- [x] Bundle size impact

### Accessibility Testing ✅
- [x] WCAG 2.1 AA compliance (axe testing)
- [x] ARIA attributes and labels
- [x] Keyboard navigation
- [x] Screen reader support
- [x] High contrast mode
- [x] Reduced motion preferences
- [x] Focus management
- [x] Semantic HTML structure

### Internationalization Testing ✅
- [x] English/Farsi language switching
- [x] RTL text support
- [x] Cached translation optimization
- [x] Status label translations

### Edge Cases & Error Handling ✅
- [x] Network failures
- [x] Invalid data structures
- [x] Missing trip/date information
- [x] Expired booking scenarios
- [x] Race conditions in state updates
- [x] Component unmounting cleanup

## Running Tests

```bash
# Run all SeatSelector tests
pnpm test:int --testPathPattern=SeatSelector

# Run specific test category
pnpm test:int hooks/useSeatSelector.int.spec.ts
pnpm test:int SeatSelector.accessibility.int.spec.ts
pnpm test:int SeatSelector.performance.int.spec.ts

# Run with coverage
pnpm test:int --coverage --testPathPattern=SeatSelector
```

## Test Utilities & Mocks

### Mocked Dependencies
- **PayloadCMS UI hooks** - `useFormFields`, `useField`, `useDocumentInfo`, etc.
- **Language hook** - `useLanguage` for i18n testing
- **Framer Motion** - Simplified motion components for performance
- **Intersection Observer** - Browser API mocking
- **SWR** - Data fetching library mocking

### Test Data Factories
- `createMockTrip(seatCount)` - Generates trips with specified seat counts
- `createDefaultHookReturn()` - Standard hook return values
- `mockTranslations` - English/Farsi translation objects

## Performance Benchmarks

The tests include performance assertions:
- **Small grids (≤16 seats)**: < 50ms render time
- **Medium grids (17-50 seats)**: < 100ms render time  
- **Large grids (51-100 seats)**: < 200ms render time (virtualized)
- **Extreme grids (500+ seats)**: < 300ms render time (virtualized)

## Accessibility Standards

All tests must pass:
- **WCAG 2.1 Level AA** compliance
- **axe-core** automated testing
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support

## Test Philosophy

These tests follow the **Testing Trophy** approach:
1. **Unit Tests** (70%) - Fast, isolated, pure functions
2. **Integration Tests** (20%) - Component interactions and hooks
3. **E2E Tests** (10%) - Critical user journeys (handled by Playwright)

### Key Principles
- **Test behavior, not implementation** - Focus on what the user experiences
- **Arrange, Act, Assert** - Clear test structure
- **Mock external dependencies** - Control test environment
- **Performance regression prevention** - Benchmark critical paths
- **Accessibility first** - Every feature tested for a11y compliance

## Continuous Integration

These tests are designed to run in CI/CD pipelines with:
- **Parallel execution** support
- **Deterministic results** (no flaky tests)
- **Performance regression detection**
- **Accessibility audit integration**

## Test Maintenance

When adding new features:
1. Add unit tests for new utilities/hooks
2. Update integration tests for new interactions
3. Add accessibility tests for new UI elements
4. Include performance tests if adding complex logic
5. Update visual tests for new CSS/styling

The test suite is designed to be **maintainable**, **comprehensive**, and **fast** - ensuring the SeatSelector component remains reliable in production.