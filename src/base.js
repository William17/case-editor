import EventEmitter from 'eventemitter3';

export default class Base extends EventEmitter {
  constructor() {
    super();
  }

  initEvents() {
    const events = this.events || {};
    const bindEvent = (type ,callback) => {
      this.on(type, callback.bind(this));
    }
    let cb;
    for (let key of Object.keys(events)) {
      cb = events[key];
      if (typeof cb === 'array') {
        cb.forEach(function(item) {
          bindEvent(key, item);
        });
      } else {
        bindEvent(key, cb);
      }
    }
  }
}