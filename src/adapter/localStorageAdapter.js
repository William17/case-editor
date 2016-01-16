import BaseAdapter from './baseAdapter';

export default class LocalStorageAdapter extends BaseAdapter {

  getInitState(cb) {
    cb && cb(null, {
      objs: {},
      openedIds: [],
      activeId: 0
    });
  }

  updateState(state, cb) {
    this.state = state;
    cb && cb(null, state);
  }

  saveState(state, cb) {
    // save to local
  }

  getDefaultSetting(cb) {
    cb && cb(null, {
      theme: ''
    });
  }

  updateSetting(setting, cb) {
    // update the view ?
    this.setting = setting;
  }

  saveSetting(cb) {
    //  save to local
  }

  setting(name, value) {
    // get or set setting
    const setting = this.setting;
    if (typeof value !== 'undefined') {
      setting[name] = value;
    } else {
      return this.setting[name];
    }
  }

  genObjId(cb) {
    const id = '_' + Math.random().toString().substr(-10);
    if (this.state.objs[id]) {
      cb && cb(this.genObjId());
    }
    cb && cb(null,id);
  }

  createObj(obj, cb) {
    const objs = this.state.objs;
    this.genObjId((err, id) => {
      obj.id = id;
      objs[id] = obj;
      cb && cb(null, obj);
    });
  }

  deleteObj(id, cb) {
    const objs = this.state.objs;
    let ids = [];
    for (let key of Object.keys(objs)) {
      if (key == id || objs[key].parent == id) {
        delete objs[key];
        ids.push(key);
      }
    }
    cb && cb(null, ids);
  }

  updateObj(obj, cb) {
    this.state.objs[obj.id] = obj;
    cb && cb(null, obj);
  }

  openObj(id, cb) {
    const state = this.state;
    const { objs, openedIds } = state;
    const obj = objs[id];
    openedIds.push(id);
    state.activeId = id;
    cb && cb(null, obj);
  }

  activeObj(id, cb) {
    const state = this.state;
    if (state.openedIds.indexOf(id) > -1) {
      state.activeId = id;
      cb && cb(null, id);
    } else {
      cb && cb(new Error(`You should open the file before activing it`), id);
    }
  }

  closeObj(id, cb) {
    const state = this.state;
    const openedIds = state.openedIds;
    const index = openedIds.indexOf(id);
    if(index > -1) {
      openedIds.splice(index,1);
    }
    state.activeId = 0;
    cb && cb(null, id);
  }

  downloadObj(id) {

  }

  moveObj(id, toObj, cb) {

  }


}
