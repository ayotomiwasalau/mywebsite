function createInputManager() {
  const controls = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    Space: false,
  };

  const touchTarget = {
    x: 0,
    y: 0,
    active: false,
  };

  const buttons = {
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
    shootBtn: document.getElementById('shootBtn'),
  };

  function setupKeyboardInput(shootCallback) {
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      let key = event.key;
      if (key === ' ' || key === 'Spacebar') {
        key = 'Space';
      }
      if (Object.prototype.hasOwnProperty.call(controls, key)) {
        controls[key] = true;
      }
      if (key === 'Space') {
        event.preventDefault();
        shootCallback();
      }
    });

    window.addEventListener('keyup', (event) => {
      let key = event.key;
      if (key === ' ' || key === 'Spacebar') {
        key = 'Space';
      }
      if (Object.prototype.hasOwnProperty.call(controls, key)) {
        controls[key] = false;
      }
    });
  }

  function setupTouchInput(shootCallback) {
    Object.entries(buttons).forEach(([name, button]) => {
      if (!button) return;
      const keyMap = {
        upBtn: 'ArrowUp',
        downBtn: 'ArrowDown',
        leftBtn: 'ArrowLeft',
        rightBtn: 'ArrowRight',
        shootBtn: 'Space',
      };
      const sharedKey = keyMap[name];
      const onStart = (event) => {
        event.preventDefault();
        if (sharedKey === 'Space') shootCallback();
        else controls[sharedKey] = true;
      };
      const onEnd = (event) => {
        event.preventDefault();
        if (sharedKey !== 'Space') controls[sharedKey] = false;
      };

      button.addEventListener('touchstart', onStart, { passive: false });
      button.addEventListener('touchend', onEnd, { passive: false });
      button.addEventListener('touchcancel', onEnd, { passive: false });
      button.addEventListener('mousedown', onStart);
      button.addEventListener('mouseup', onEnd);
      button.addEventListener('mouseleave', () => {
        if (sharedKey !== 'Space') controls[sharedKey] = false;
      });
    });
  }

  function getCanvasPoint(canvasElement, clientX, clientY) {
    const rect = canvasElement.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function setupCanvasTouchNavigation(canvasElement, options = {}) {
    if (!canvasElement) return;

    const { shootCallback, isPointOnBus } = options;
    let pointerDownOnBus = false;
    let activePointerId = null;

    const setTarget = (clientX, clientY) => {
      const point = getCanvasPoint(canvasElement, clientX, clientY);
      touchTarget.x = point.x;
      touchTarget.y = point.y;
      touchTarget.active = true;
    };

    const clearTarget = () => {
      touchTarget.active = false;
    };

    const endPointer = (event) => {
      if (activePointerId !== null && event.pointerId !== activePointerId) return;
      pointerDownOnBus = false;
      controls.Space = false;
      clearTarget();
      activePointerId = null;
      if (canvasElement.hasPointerCapture(event.pointerId)) {
        canvasElement.releasePointerCapture(event.pointerId);
      }
    };

    canvasElement.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      canvasElement.setPointerCapture(event.pointerId);
      activePointerId = event.pointerId;

      const point = getCanvasPoint(canvasElement, event.clientX, event.clientY);
      if (isPointOnBus && isPointOnBus(point.x, point.y)) {
        pointerDownOnBus = true;
        if (shootCallback) shootCallback();
        controls.Space = true;
        return;
      }

      pointerDownOnBus = false;
      setTarget(event.clientX, event.clientY);
    });

    canvasElement.addEventListener('pointermove', (event) => {
      if (event.pointerId !== activePointerId || pointerDownOnBus) return;
      event.preventDefault();
      setTarget(event.clientX, event.clientY);
    });

    canvasElement.addEventListener('pointerup', endPointer);
    canvasElement.addEventListener('pointercancel', endPointer);
  }

  return {
    controls,
    touchTarget,
    setupKeyboardInput,
    setupTouchInput,
    setupCanvasTouchNavigation,
  };
}
