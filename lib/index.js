'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _lodashReduce = require('lodash.reduce');

var _lodashReduce2 = _interopRequireDefault(_lodashReduce);

var _lodashZipobject = require('lodash.zipobject');

var _lodashZipobject2 = _interopRequireDefault(_lodashZipobject);

var _lodashSortby = require('lodash.sortby');

var _lodashSortby2 = _interopRequireDefault(_lodashSortby);

var _lodashCompact = require('lodash.compact');

var _lodashCompact2 = _interopRequireDefault(_lodashCompact);

var _lodashCamelcase = require('lodash.camelcase');

var _lodashCamelcase2 = _interopRequireDefault(_lodashCamelcase);

var _lodashIsstring = require('lodash.isstring');

var _lodashIsstring2 = _interopRequireDefault(_lodashIsstring);

var DEFAULT_TAGS = {
  'html': 'span'
};

var DEFAULT_RULES = {
  image: function image(token, attrs, children) {
    if (children.length) {
      attrs = (0, _lodashAssign2['default'])({}, attrs, { alt: children[0] });
    }
    return [[token.tag, attrs]];
  },

  codeInline: function codeInline(token, attrs) {
    return [(0, _lodashCompact2['default'])([token.tag, attrs, token.content])];
  },

  codeBlock: function codeBlock(token, attrs) {
    return [['pre', (0, _lodashCompact2['default'])([token.tag, attrs, token.content])]];
  },

  fence: function fence(token, attrs) {
    if (token.info) {
      var langName = token.info.trim().split(/\s+/g)[0];
      attrs = (0, _lodashAssign2['default'])({}, attrs, { 'data-language': langName });
    }

    return [['pre', (0, _lodashCompact2['default'])([token.tag, attrs, token.content])]];
  },

  hardbreak: function hardbreak() {
    return [['br']];
  },

  softbreak: function softbreak(token, attrs, children, options) {
    return options.breaks ? [['br']] : '\n';
  },

  text: function text(token) {
    return token.content;
  },

  htmlBlock: function htmlBlock(token) {
    return token.content;
  },

  htmlInline: function htmlInline(token) {
    return token.content;
  },

  inline: function inline(token, attrs, children) {
    return children;
  },

  'default': function _default(token, attrs, children, options, getNext) {
    if (token.nesting === 1 && token.hidden) {
      return getNext();
    }
    /* plugin-related */
    if (!token.tag) {
      return token.content;
    }
    if (token.info) {
      attrs = (0, _lodashAssign2['default'])({}, attrs, { 'data-info': token.info.trim() });
    }
    /* plugin-related */
    return [(0, _lodashCompact2['default'])([token.tag, attrs].concat(token.nesting === 1 && getNext()))];
  }
};

function convertTree(tokens, convertRules, options) {
  function convertBranch(tkns, nested) {
    var branch = [];

    if (!nested) {
      branch.push('html');
    }

    function getNext() {
      return convertBranch(tkns, true);
    }

    var token = tkns.shift();
    while (token && token.nesting !== -1) {
      var attrs = token.attrs && (0, _lodashZipobject2['default'])((0, _lodashSortby2['default'])(token.attrs, 0));
      var children = token.children && convertBranch(token.children.slice(), true);
      var rule = convertRules[(0, _lodashCamelcase2['default'])(token.type)] || convertRules['default'];

      branch = branch.concat(rule(token, attrs, children, options, getNext));
      token = tkns.shift();
    }
    return branch;
  }

  return convertBranch(tokens, false);
}

function mdReactFactory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var onIterate = options.onIterate;
  var _options$tags = options.tags;
  var tags = _options$tags === undefined ? DEFAULT_TAGS : _options$tags;
  var presetName = options.presetName;
  var markdownOptions = options.markdownOptions;
  var _options$enableRules = options.enableRules;
  var enableRules = _options$enableRules === undefined ? [] : _options$enableRules;
  var _options$disableRules = options.disableRules;
  var disableRules = _options$disableRules === undefined ? [] : _options$disableRules;
  var _options$plugins = options.plugins;
  var plugins = _options$plugins === undefined ? [] : _options$plugins;
  var _options$onGenerateKey = options.onGenerateKey;
  var onGenerateKey = _options$onGenerateKey === undefined ? function (tag, index) {
    return 'mdrct-' + tag + '-' + index;
  } : _options$onGenerateKey;

  var rootElementProps = _objectWithoutProperties(options, ['onIterate', 'tags', 'presetName', 'markdownOptions', 'enableRules', 'disableRules', 'plugins', 'onGenerateKey']);

  var md = (0, _markdownIt2['default'])(markdownOptions || presetName).enable(enableRules).disable(disableRules);

  var convertRules = (0, _lodashAssign2['default'])({}, DEFAULT_RULES, options.convertRules);

  md = (0, _lodashReduce2['default'])(plugins, function (m, plugin) {
    return plugin.plugin ? m.use.apply(m, [plugin.plugin].concat(_toConsumableArray(plugin.args))) : m.use(plugin);
  }, md);

  function renderChildren(tag) {
    return tag !== 'img';
  }

  function iterateTree(tree) {
    var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    var tag = tree.shift();
    var key = onGenerateKey(tag, index);

    var props = tree.length && (0, _lodashIsplainobject2['default'])(tree[0]) ? (0, _lodashAssign2['default'])(tree.shift(), { key: key }) : { key: key };

    if (level === 0) {
      props = _extends({}, props, rootElementProps);
    }

    var children = tree.map(function (branch, idx) {
      return Array.isArray(branch) ? iterateTree(branch, level + 1, idx) : branch;
    });

    tag = tags[tag] || tag;

    if ((0, _lodashIsstring2['default'])(props.style)) {
      props.style = (0, _lodashZipobject2['default'])(props.style.split(';').map(function (prop) {
        return prop.split(':');
      }).map(function (keyVal) {
        return [(0, _lodashCamelcase2['default'])(keyVal[0].trim()), keyVal[1].trim()];
      }));
    }

    return typeof onIterate === 'function' ? onIterate(tag, props, children, level) : _react2['default'].createElement(tag, props, renderChildren(tag) ? children : undefined);
  }

  return function (text) {
    var tree = convertTree(md.parse(text, {}), convertRules, md.options);
    return iterateTree(tree);
  };
}

var MDReactComponent = function MDReactComponent(props) {
  var text = props.text;

  var propsWithoutText = _objectWithoutProperties(props, ['text']);

  return mdReactFactory(propsWithoutText)(text);
};

MDReactComponent.propTypes = {
  text: _react.PropTypes.string.isRequired,
  onIterate: _react.PropTypes.func,
  onGenerateKey: _react.PropTypes.func,
  tags: _react.PropTypes.object,
  presetName: _react.PropTypes.string,
  markdownOptions: _react.PropTypes.object,
  enableRules: _react.PropTypes.array,
  disableRules: _react.PropTypes.array,
  convertRules: _react.PropTypes.object,
  plugins: _react.PropTypes.array,
  className: _react.PropTypes.string
};

exports['default'] = MDReactComponent;
exports.mdReact = mdReactFactory;