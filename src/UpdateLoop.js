import performance from 'perf_hooks';

/**
 * Class for keeping track of which objects should be updated every frame.
 * Objects can register for earlyUpdate
 */
export default class UpdateLoop {
  /**
   * Creates a new event loop and starts it if autoStart is true.
   * The event loop can be manually started and stopped if needed.
   *
   * @param {number} targetFPS - desired max FPS to run loop at
   * @param {number} tolerance - allow frames that run slightly before
   */
  constructor(targetFPS = 60, mode) {
    this.objects = [];
    this.active = false;
    this.targetFPS = targetFPS;
    this.timer = null;
    this.frame = 0;
    this.mode = mode || UpdateLoop.INTERVAL;
    this.tolerance = .1;
    this.start();
  }

  /**
   * Getter function for converting FPS to ms
   * @return {number} interval - time in milliseconds
   */
  get delay() {
    return Math.floor(1000 / this.targetFPS);
  }

  /**
   * Starts running the event loop every frame
   */
  start() {
    this.totalJitter = 0;
    this.frame = -1;

    if (this.timer === null) {
      this.lastUpdate = performance.now();

      switch(this.mode) {
        case UpdateLoop.INTERVAL:
          this.createIntervalLoop();
          break;
        case UpdateLoop.RAF:
          this.createRAFLoop();
          break;
        default:
          throw new Error('Invalid UpdateLoop Mode. Refer to documenation for valid modes');
      }

      this.active = true;
      this.loop.start();
    }
  }

  createIntervalLoop() {
    this.loop = {
      start: () => {
        this.loop.timer = setInterval(this.loop.update.bind(this), this.delay);
      },
      update: () => {
        this.frame += 1;
        this.update(performance.now());
      },
      stop: () => {
        clearInterval(this.loop.timer);
      }
    }
  }

  createRAFLoop() {
    this.loop = {
      start: () => {
        this.loop.update();
        this.loop.startTime = performance.now();
      },
      update: () => {
        const now = performance.now();
        var frame = Math.floor((now - this.loop.startTime) / this.delay);

        if (!this.targetFPS || frame > this.frame) {
          this.droppedFrame = this.frame - frame >= 2;
          this.frame = frame;
          this.update(now);
          this.lastUpdate = now;
        }

       this.loop.raf = requestAnimationFrame(this.loop.update);
     },
      stop: () => {
        cancelAnimationFrame(this.loop.raf);
      }
    }
  }

  /**
   * Stops running the event loop every frame
   */
  stop() {
    this.loop.stop();
    this.active = false;
    this.frame = -1;
  }

  /**
   * Adds a new object to run every frame. This can either be an object or
   * function. If its an object it can define earlyUpdate, update or lateUpdate.
   * If its a function, it will be treated as the update function.
   *
   * @param {object|Function} obj - object or function to run update on
   */
  register(obj) {
    if (this.objects.includes(obj) === false) {
      this.objects.push(obj);
    }
  }

  /**
   * Removes the object from being called every frame
   *
   * @param {object|Function} obj - object or function to remove from event loop
   */
  unregister(obj) {
    this.objects = this.objects.filter((stored) => stored !== obj);
  }

  /**
   * Run the update functions for any objects that have registered one.
   * The order of execution is earlyUpdate -> update -> lateUpdate
   * Delta time is passed to every update function
   */
  update(now) {
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    // Calculate how much the frame was off by
    this.jitter = Math.abs(deltaTime - this.delay);
    this.totalJitter += this.jitter;

    for (const obj of this.objects) {
      if (obj.earlyUpdate && typeof obj.earlyUpdate === 'function') {
        obj.earlyUpdate(deltaTime);
      }
    }

    // Run the update if defined for each object
    for (const obj of this.objects) {
      if (obj.update && typeof obj.update === 'function') {
        obj.update(deltaTime);
      } else if (typeof obj === 'function') {
        obj(deltaTime);
      }
    }

    // Run the lateUpdate if defined for each object
    for (const obj of this.objects) {
      if (typeof obj.lateUpdate === 'function') {
        obj.lateUpdate(deltaTime);
      }
    }
  }

  get averageJitter() {
    return this.totalJitter / this.frame;
  }
}

UpdateLoop.INTERVAL = 0;
UpdateLoop.RAF = 1;
