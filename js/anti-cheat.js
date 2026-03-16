export function createAntiCheatController({ onIncident, onLockChange, isSessionActive }) {
  let enabled = false;
  let incidentCount = 0;
  let locked = false;

  const lockQuiz = () => {
    if (!enabled || !isSessionActive() || locked) {
      return;
    }
    locked = true;
    incidentCount += 1;
    onIncident(incidentCount);
    onLockChange(true, incidentCount);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      lockQuiz();
    }
  };

  const handleBlur = () => {
    lockQuiz();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);

  return {
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        incidentCount = 0;
        locked = false;
        onLockChange(false, incidentCount);
      }
    },
    resume() {
      locked = false;
      onLockChange(false, incidentCount);
    },
    reset() {
      incidentCount = 0;
      locked = false;
      onLockChange(false, incidentCount);
    },
    isLocked() {
      return locked;
    },
    getIncidentCount() {
      return incidentCount;
    },
    destroy() {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    },
  };
}
