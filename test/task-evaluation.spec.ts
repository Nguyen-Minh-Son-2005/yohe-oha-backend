describe('Task Evaluation & Time Window Logic', () => {
  function toMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function evaluateTimeWindow(
    task: { startTime: string; endTime: string; bufferMinutes: number },
    currentTimeStr: string,
  ) {
    const startMins = toMinutes(task.startTime);
    const endMins = toMinutes(task.endTime);
    const currentMins = toMinutes(currentTimeStr);
    const buffer = task.bufferMinutes || 30;

    const inExactWindow = currentMins >= startMins && currentMins <= endMins;
    const inBufferWindow =
      (currentMins >= startMins - buffer && currentMins < startMins) ||
      (currentMins > endMins && currentMins <= endMins + buffer);

    let status = 'UPCOMING';
    if (inExactWindow) {
      status = 'ONGOING';
    } else if (currentMins > endMins + buffer) {
      status = 'MISSED';
    }

    return { inExactWindow, inBufferWindow, status };
  }

  const sampleMealTask = {
    startTime: '12:00',
    endTime: '12:45',
    bufferMinutes: 30,
  };

  it('should be ONGOING and inExactWindow when checked inside the task window', () => {
    const result = evaluateTimeWindow(sampleMealTask, '12:20');
    expect(result.inExactWindow).toBe(true);
    expect(result.inBufferWindow).toBe(false);
    expect(result.status).toBe('ONGOING');
  });

  it('should be inBufferWindow and UPCOMING when checked 15 mins before start time', () => {
    const result = evaluateTimeWindow(sampleMealTask, '11:45');
    expect(result.inExactWindow).toBe(false);
    expect(result.inBufferWindow).toBe(true);
    expect(result.status).toBe('UPCOMING');
  });

  it('should be inBufferWindow when checked 20 mins after end time', () => {
    const result = evaluateTimeWindow(sampleMealTask, '13:05');
    expect(result.inExactWindow).toBe(false);
    expect(result.inBufferWindow).toBe(true);
  });

  it('should be MISSED when checked more than buffer time after end time', () => {
    const result = evaluateTimeWindow(sampleMealTask, '13:20');
    expect(result.inExactWindow).toBe(false);
    expect(result.inBufferWindow).toBe(false);
    expect(result.status).toBe('MISSED');
  });

  it('should be UPCOMING and not in buffer when checked long before buffer starts', () => {
    const result = evaluateTimeWindow(sampleMealTask, '10:00');
    expect(result.inExactWindow).toBe(false);
    expect(result.inBufferWindow).toBe(false);
    expect(result.status).toBe('UPCOMING');
  });
});

describe('Health Metrics Calculation Logic', () => {
  it('should calculate BMI correctly according to Asian criteria', () => {
    const heightCm = 170;
    const weightKg = 65;
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    expect(bmi).toBe(22.5); // Normal in Asia (< 23)
  });

  it('should calculate BMR for male correctly with Mifflin-St Jeor', () => {
    const age = 21;
    const heightCm = 175;
    const weightKg = 68;
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    expect(bmr).toBe(1673.75);
  });

  it('should calculate BMR for female correctly with Mifflin-St Jeor', () => {
    const age = 22;
    const heightCm = 160;
    const weightKg = 50;
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    expect(bmr).toBe(1229);
  });
});
