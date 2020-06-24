(() => {
    const whatType = item => item.nodeType !== undefined ? 'dom' : toString.call(item).replace('[', '').replace(']', '').split(' ')[1].toLowerCase();
    const readSelector = selector => {
        if(selector === undefined) return Array.from([]);
        let elements = [];
        let type = whatType(selector);
        switch (type) {
            case 'dom': 
                elements = [selector]; 
            break;
            case 'string': 
                elements = document.querySelectorAll(selector); 
            break;
            case 'nodelist': 
            case 'array': 
                elements = selector; 
            break;
        }
        return Array.from(elements);
    }
    const eventTrigger = (element, eventName) => {
        const event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, false);
        element.dispatchEvent(event);
    }

    const serialize = (form, arrayMode = false) => {
        let arr = [];
        Array.prototype.slice.call(form.elements).forEach( (field) => {
            if (!field.name || field.disabled || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) return;
            if (field.type === 'select-multiple') {
                Array.prototype.slice.call(field.options).forEach( (option) => {
                    if (!option.selected) return;
                    arrayMode
                    if(arrayMode) {
                        arr[field.name] = arr[field.name] ?? [];
                        arr[field.name].push(option.value);
                    } else {
                        arr.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(option.value));
                    }
                });
                return;
            }
            if (['checkbox', 'radio'].indexOf(field.type) >-1 && !field.checked) return;
            if(arrayMode) {
                arr[field.name] = arr[field.name] ?? [];
                arr[field.name].push(field.value);
            } else {
                arr.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
            }
        });
        return arrayMode ? arr : arr.join('&');
    }

    function wk (selector) {
        const obj = {};
        const elements = readSelector(selector);
        return {
            elements,
            selector,
            each: function (callback) {
                elements.forEach(element => callback( element ));
            },
            first: function (returnVanilla = true) {
                return returnVanilla ? elements[0] : wk(elements[0]);
            },
            remove: function () {
                this.first().parentNode.removeChild(this.first());
                return this;
            },
            html: function (newHtml) {
                if(newHtml !== undefined) {
                    this.each(element => element.innerHTML = newHtml);
                } else return this.first().innerHTML;
                return this;
            },
            css: function (newCss) {
                this.each(element => Object.assign(element.style, newCss));
                return this;
            },
            hiden: function () {
                this.each(element => element.style.display = 'none');
                return this;
            },
            show: function () {
                this.each(element => element.style.removeProperty('display'));
                return this;
            },
            toggle: function () {
                this.each(element => {
                    if(element.style.display === 'none') {
                        element.style.removeProperty('display');
                    } else {
                        element.style.display = 'none';
                    }
                });
                return this;
            },
            addClass: function (className) {
                this.each(element => element.classList.add(className));
                return this;
            },
            removeClass: function (className) {
                this.each(element => element.classList.remove(className));
                return this;
            },
            toggleClass: function (className) {
                this.each(element => element.classList.toggle(className));
                return this;
            },
            hasClass: function(className) {
                return this.first().classList.contains(className);
            },
            trigger: function (eventName) {
                this.each(element => eventTrigger(element, eventName));
                return this;
            },
            parent: function (eventName) {
                return this.first().parentNode;
            },
            parents: function (selector) {
                return this.first().closest(selector);
            },
            find: function (selector) {
                return wk(this.first().querySelectorAll(selector));
            },
            data: function (key,value) {
                if(key !== undefined) {
                    if (typeof key === 'string' && value !== undefined) {
                        key = {key, value};
                        value = undefined;
                    }
                    if (typeof key === 'string' && value === undefined) {
                        return this.first().dataset[key];
                    } else if(typeof key === 'object' && value === undefined) {
                        this.each(element => Object.assign(element.dataset, key));
                    }
                }
                return this;
            },
            removeData: function (key) {
                this.each(element => element.removeAttribute(`data-${key}`));
                return this;
            },
            attr: function (key,value) {
                if(key !== undefined) {
                    if (typeof key === 'string' && value !== undefined) {
                        key = {key, value};
                        value = undefined;
                    }
                    if (typeof key === 'string' && value === undefined) {
                        return this.first().getAttribute(key);
                    } else if(typeof key === 'object' && value === undefined) {
                        this.each(element => {
                            for (let i in key) {
                                element.setAttribute(i, key[i]);
                            }
                        });
                    }
                }
                return this;
            },
            removeAttr: function (key) {
                this.each(element => element.removeAttribute(key));
                return this;
            },
            eq: function (index) {
                return index !== undefined ? ( (elements[index] !== undefined) ? wk(elements[index]) : null ) : this;
            },
            get: function (index) {
                return index === undefined ? this.elements : this.elements[index];
            },
            ready: function (callback) {
                const rs = document.readyState;
                if (rs !== 'loading') {
                    callback();
                } else if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', callback);
                } else {
                    document.attachEvent('onreadystatechange', () => {
                        if (rs === 'complete') callback();
                    });
                }
                return this;
            },
            on: function ( evt, selector, handler = undefined) {
                const _this = this;
                this.each(element => {
                    element.addEventListener(evt, function (event) { 
                        let callback = handler == undefined ? selector : handler;
                        if ( typeof selector === 'string' && event.target.matches(selector + ', ' + selector + ' *') ) {
                            callback.apply(event.target.closest(selector), arguments);
                        } else {
                            if (typeof _this.selector === 'string' && event.target.matches(_this.selector + ', ' + _this.selector + ' *') ) {
                                callback.apply(event.target, arguments);
                            }
                        }
                    });
                });
                return this;
            },
            serialize: function () {
                return serialize(this.first());
            },
            serializeArray: function () {
                serialize(this.first(), true);
            },
        }

    }
    window.wk = wk;
})();
