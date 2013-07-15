/**
 * StdClass include method get,set and init
 * abstruct class
 * @class StdClass
 * @author hanwen
 * @TODO
 * 1. 事件组合
 * 2. 多属性管理
 * 3. debug控制
 * [-] 2013-07-07删除once方法，在原生的node已经支持
 * [+] 2011-12-1修改set方法，增加change:xxx:xxx时间，对应与某个属性值的变化
 * [+] set方法增加force强制不触发事件的配置
 */
var Events  = require('events').EventEmitter;
var util    = require('util');
var TRIM_REG = /(^\s+)|(\s+$)/g;

/**
 * 原型继承方法,调用util.inherits
 * @param {Function} constructor 构造器
 * @param {Function} superConstructor 父构造器
 * @param {Object} methods 自定义方法或属性
 */
function extend(constructor, superConstructor, methods){
  util.inherits(constructor, superConstructor);

  for (var i in methods){
    constructor.prototype[i] = methods[i];
  }
}

function StdClass(){
  this.init.apply(this, arguments);
}

StdClass.extend = extend;

extend(StdClass, Events, {

  //属性集合，在每个子对象中，相对独立
  attributes: {},

  //共有属性集合
  CONSIT: {},

  /**
   * 对于attributes下的都进行触发事件，其他对象的修改，不触发事件，除非
   * 强制设置force为true
   * @param opt_force {bool}
   * @param opt_data  {object} data to event
   */
  set: function set(key, value, opt_force, opt_data) {

    var type   = this.getType(key);
    var old    = this[type][key];
    var isFire = false;

    //设置value
    if (type === 'nodes'){
      this[type][key] = value;
    }

    //判断时候触发事件
    if (type === 'attributes'){
      if (value != old || opt_force === true) isFire = true;
    } else {
      if (opt_force) isFire = 1;
    }

    //触发事件
    if (isFire && opt_force !== false){

      opt_data = opt_data || {};
      opt_data.old = old;
      opt_data.now = value;
      opt_data.target = this;

      this.emit('change:' + key, opt_data);
      isFire === true && this.emit('change:' + key + ':'+value, opt_data);

    }

    return this;
  },

  //判断属性对象的类型
  //node | attr | consit
  //依次从attributes>nodes>CONSIT中查找
  getType: function getType(key){

    var o = {
      attributes : this.attributes, 
      CONSIT     : this.CONSIT
    };

    var ret = false;

    for (var i in o){

      if (key in o[i]){
        ret = i;
        break;
      }

    }

    return ret;

  },

  /**
   * 获取属性，如果属性位于nodes中，在第一次获取对象时，如果不是Node
   * 则使用S.all获取之，并且返回获得的node
   * @param {String} key
   */
  get: function get(key){ 
    var type = this.getType(key);
    var ret  = this[type][key];
    return ret;
  },

  init: function initialize(cfg){

    //建立相对独立的attributes属性表
    var attributes = {};
    for (var i in this.attributes){
      attributes[i] = this.attributes[i];
    }
    this.attributes = attributes;

    //初始化自定义配置
    for (var j in cfg) {
      this.attributes[j] = cfg[j];
    }

    this._init && this._init();
  }

});

module.exports = StdClass;
