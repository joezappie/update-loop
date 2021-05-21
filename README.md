# update-loop
A unity style event loop for Javascript that has callbacks for earlyUpdate, update, and lateUpdate. Select a target FPS or choose to update with monitor refresh rate.

## Instructions

To use this library, create a new update loop. The loop will start immediately.

```
const loop = new UpdateLoop(60, [mode]);
```

You can then register objects to the event loop, defining earlyUpdate, update and/or lateUpdate.

```
class MyObject {
  earlyUpdate() {
    // Code to perform first
  }
  
  update() {
    // Normal execution level. Put things that order doesnt matter here
  }
  
  lateUpdate() {
    // Code to perform last
  }
}

const obj = new MyObject();
loop.register(obj);
```

You can also stop an object from running on the event loop:

```
loop.unregister(obj);
```

## Modes

There are two modes for the event loop:
1. UpdateLoop.INTERVAL: Uses setInterval() (default)
2. UpdateLoop.RAF: Uses requestAnimationFrame()

If you want to switch to using RAF:

```
const loop = new UpdateLoop(60, UpdateLoop.RAF);
```

In both modes you can specify a desired FPS. Depending on what your application is, one or the other might be better. If your doing animation with canvas or a 3d library, you might want to use RAF. The drawback is it works best with FPS like 15, 30, 60, 120. Getting an interval like 24 FPS would be less percise than using the INTERVAL mode.

In RAF Mode, if you would like the FPS to be uncapped, provide null for targetFPS. If an FPS is specified it will throttle the FPS.

## API

#### Functions

```
// Stop the update loop
loop.stop();

// Start the update loop
loop.start();
```

#### Properties

```
loop.jitter           // Difference between deltaTime and desired interval
loop.averageJitter    // Average jitter since the loop started
loop.frame            // How many frames have been generated since the loop started
```  
  
  
  
  
