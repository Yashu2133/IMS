// In-memory store: { componentId -> workItemId }
const debounceMap = new Map();

// Clear a component from the map after 10 seconds
const DEBOUNCE_WINDOW_MS = 10000;

/**
 * Returns existing workItemId if one exists for this component
 * within the debounce window. Otherwise returns null.
 */
function getExistingWorkItem(componentId) {
  return debounceMap.get(componentId) || null;
}

/**
 * Register a new workItem for a component.
 * Auto-clears after 10 seconds.
 */
function registerWorkItem(componentId, workItemId) {
  debounceMap.set(componentId, workItemId);

  setTimeout(() => {
    debounceMap.delete(componentId);
    console.log(`Debounce window closed for: ${componentId}`);
  }, DEBOUNCE_WINDOW_MS);
}

module.exports = { getExistingWorkItem, registerWorkItem };