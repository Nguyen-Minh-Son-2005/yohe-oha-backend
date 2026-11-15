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

describe('Contextual Message & Schedule Awareness Logic', () => {
  function toMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function resolveMessageSlot(
    timeStr: string,
    profile?: {
      workStartTime?: string;
      workEndTime?: string;
      sleepTime?: string;
      wakeTime?: string;
    },
  ) {
    const currentMins = toMinutes(timeStr);
    const hour = parseInt(timeStr.split(':')[0], 10);

    let slot = 'ALL';

    if (profile) {
      const workStartMins = profile.workStartTime ? toMinutes(profile.workStartTime) : null;
      const workEndMins = profile.workEndTime ? toMinutes(profile.workEndTime) : null;
      const sleepMins = profile.sleepTime ? toMinutes(profile.sleepTime) : null;
      const wakeMins = profile.wakeTime ? toMinutes(profile.wakeTime) : null;

      let isPostSleep = false;
      if (sleepMins !== null && wakeMins !== null) {
        if (sleepMins > wakeMins) {
          isPostSleep = currentMins >= sleepMins || currentMins < wakeMins;
        } else {
          isPostSleep = currentMins >= sleepMins && currentMins < wakeMins;
        }
      }

      let isWorking = false;
      if (workStartMins !== null && workEndMins !== null) {
        if (workStartMins <= workEndMins) {
          isWorking = currentMins >= workStartMins && currentMins <= workEndMins;
        } else {
          isWorking = currentMins >= workStartMins || currentMins <= workEndMins;
        }
      }

      if (isPostSleep) {
        slot = 'POST_SLEEP';
      } else if (isWorking) {
        slot = 'WORKING';
      }
    }

    if (slot === 'ALL') {
      if (hour >= 5 && hour < 11.5) slot = 'MORNING';
      else if (hour >= 11.5 && hour < 18) slot = 'AFTERNOON';
      else slot = 'EVENING';
    }

    return slot;
  }

  const userProfile = {
    workStartTime: '08:00',
    workEndTime: '17:00',
    sleepTime: '23:00',
    wakeTime: '06:30',
  };

  it('should resolve to WORKING when user is inside work/study hours', () => {
    const slot = resolveMessageSlot('10:30', userProfile);
    expect(slot).toBe('WORKING');
  });

  it('should resolve to POST_SLEEP when user opens app after bedtime', () => {
    const slot1 = resolveMessageSlot('23:35', userProfile);
    expect(slot1).toBe('POST_SLEEP');

    const slot2 = resolveMessageSlot('01:15', userProfile);
    expect(slot2).toBe('POST_SLEEP');
  });

  it('should resolve to AFTERNOON when outside work hours in the afternoon', () => {
    const slot = resolveMessageSlot('17:45', userProfile);
    expect(slot).toBe('AFTERNOON');
  });

  it('should replace {time} placeholder with formatted time', () => {
    const template = 'Bây giờ đã là {time}, bạn hãy đảm bảo ngủ đủ giấc nhé!';
    const timeStr = '23:45';
    const result = template.replace(/\{time\}|\{currentTime\}/g, timeStr);
    expect(result).toBe('Bây giờ đã là 23:45, bạn hãy đảm bảo ngủ đủ giấc nhé!');
  });
});
