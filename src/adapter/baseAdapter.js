/**
 *
 *  objs= [
 *   {
 *     id: xxxx,
 *     parent: xxxx
 *     name: xxxx,
 *     content: xxxx
 *   }
 *  
 *  
 *  
 *  ]
 *
 * 
 *  openedIds= [
 *   id1,
 *   id2
 *  ]
 *
 *  activeId = ''
 *
 */

export default class BaseAdapter {
  constructor() {
    this.preparation = 2;
    this.getInitState(function(err, state) {
      this.state = state;
      this.checkReady();
    }.bind(this));
    this.getDefaultSetting(function(err, setting) {
      this.setting = setting;
      this.checkReady();
    }.bind(this));
  }
  getInitState(cb) {
    cb(null, {
      objIds: [],
      objs: [],
      openedIds: [],
      activeId: ''
    });
  }

  isReady = false;
  callbackList = [];
  ready(fn) {
    if (this.isReady) {
      fn(this.state, this.setting);
    } else {
      this.callbackList.push(fn);
    }
  }
  checkReady() {
    if(!--this.preparation) {
      this.isReady = true;
      const state = this.state;
      const setting = this.setting;
      this.callbackList.forEach((fn) => {
        fn(state, setting)
      });
      this.callbackList = null;
    }
  }

  updateState(state, cb) {

  }

  saveState(state, cb) {

  }

  getDefaultSetting(cb) {
    cb(null, {});
  }

  updateSetting(setting, cb) {

  }

  saveSetting(setting, cb) {

  }

  setting(name, value) {
  }

  genObjId(cb) {
  }

  createObj(obj, cb) {
  }

  deleteObj(id, cb) {
  }

  updateObj(obj, cb) {
  }

  openObj(id, cb) {
  }

  activeObj(id, cb) {
  }

  closeObj(id, cb) {
  }

  downloadObj(id) {

  }

  moveObj(id, toObj, cb) {

  }


}
