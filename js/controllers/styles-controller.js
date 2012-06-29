/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component        = require("montage/ui/component").Component,
    cssShorthandMap  = require("js/panels/CSSPanel/css-shorthand-map").CSS_SHORTHAND_MAP,
    nj               = require("js/lib/NJUtils").NJUtils;

/*

Styles Manager
________________________________________
Interface for dealing with stylesheets
Properties:
 - Stage stylesheet
 - Default user stylesheet (e.g. styles.css)

Methods:
 - Rules:
     - Get matching rules for element
     - Add rule
     - Delete rule
     - Enable rule
     - Disable rule
 - Styles:
     - Add styles of existing rules
     - Delete styles of existing rules
     - Enable style
     - Disable style
 - Stylesheets:
     - Add local or external stylesheets (needs file I/O for creating external sheets)
     - Delete stylesheets
     - Enable  stylesheets
     - Disable stylesheets
     
     use case : set background color
      - needs to know most specific rule WITH that property
      - 

*/

var stylesController = exports.StylesController = Montage.create(Component, {
    
    ///// Initialize after the active document has been set, and
    ///// bind the document to prop w/ setter. The setter calls to find
    ///// the stage and default css files.

    ///// Active document gets automatically set when the 
    ///// document controller changes it
    _currentDocument : {
        value : null,
        enumerable : false
    },
    
    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(document) {
            ///// If the document is null set default stylesheets to null

            if(!document || document.currentView === "code") {
                this._currentDocument   = null;
                this._stageStylesheet  = null;
                this.defaultStylesheet = null;
                this.userStyleSheets   = [];
                this.clearDirtyStyleSheets();
                return false;
            }

            ///// setting document via binding
            this._currentDocument = document;
            
            ///// Stage stylesheet should always be found
            this._stageStylesheet  = this.getSheetFromElement(this.CONST.STAGE_SHEET_ID);
            // Returns null if sheet not found (as in non-ninja projects)
            // Setter will handle null case
            this.defaultStylesheet = this.getSheetFromElement(this.CONST.DEFAULT_SHEET_ID);

            this.userStyleSheets = nj.toArray(document.model.views.design.document.styleSheets).filter(function(sheet) {
                return sheet !== this._stageStylesheet;
            }, this);

            this.initializeRootStyles();

            NJevent('styleSheetsReady', this);
        },
        enumerable : false
    },
    userStyleSheets : {
        value : null
    },
    _stageStylesheet : {
        value : null
    },
    _defaultStylesheet : {
        value : null
    },
    defaultStylesheet : {
        get : function() {
            return this._defaultStylesheet;
        },
        set : function(sheet) {
            if(sheet) {
                this._defaultStylesheet = sheet;
            } else {
                if(sheet === null) {
                    this._defaultStylesheet = null;
                    return false;
                }
                //check that the document has a design view
                else if(this._currentDocument.model && this._currentDocument.model.views && this._currentDocument.model.views.design){
                    ///// Use the last stylesheet in the document as the default

                    var sheets = this._currentDocument.model.views.design.document.styleSheets,
                        lastIndex = sheets.length-1;

                    ///// If the only sheet is the stage stylesheet, this will be true
                    ///// in which case, we want to create a stylesheet to hold the
                    ///// user's style rules

                    if(sheets[lastIndex] === this._stageStyleSheet) {
                        this._defaultStylesheet = this.createStylesheet('nj-default');
                    } else {
                        this._defaultStylesheet = sheets[lastIndex];
                    }
                }
            }
        }
    },

    initializeRootStyles: {
        value: function() {
            var styles = {},
                needsRule = false,
                rule;

            if(this.getElementStyle(this.currentDocument.model.documentRoot, "width", false, false) == null) {
                styles['width'] = '100%';
                needsRule = true;
            }
            if(this.getElementStyle(this.currentDocument.model.documentRoot, "height", false, false) == null) {
                styles['height'] = '100%';
                needsRule = true;
            }
            if(this.getElementStyle(this.currentDocument.model.documentRoot, "-webkit-transform", false, false) == null) {
                styles['-webkit-transform'] = 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
                needsRule = true;
            }
            if(this.getElementStyle(this.currentDocument.model.documentRoot, "-webkit-transform-style", false, false) == null) {
                styles['-webkit-transform-style'] = 'preserve-3d';
                needsRule = true;
            }
            if(this.getElementStyle(this.currentDocument.model.documentRoot, "background-color", false, false) == null) {
                styles['background-color'] = "transparent";
                needsRule = true;
            }

            if(needsRule) {
                rule = this.addRule('.ninja-body{}');
                this.setStyles(rule, styles);
                this.addClass(this.currentDocument.model.documentRoot, "ninja-body");
            }
        }
    },
    /* ----------------- Rule methods ----------------- */
    
    ///// Add Rule
    ///// Passed in rule will be appended to the default stylesheet
    ///// The rule can be in the form of a string (one argument), or
    ///// the selector string and declaration string (two arguments), or
    ///// the selector string and a declaration object.
    ///// Optionally pass in the rule index (defaults to end of sheet)
    
    /*
    Signature 1 : 
    addRule( "#div1", "color:blue; width:100px;", 3)
              [str]    [str]                    [num]
    
    Signature 2 (w/ styles object literal): 
    addRule( "#div1", { color:"blue", width:"100px" }, 3)
              [str]    [obj]                         [num]
    
    Signature 3 (w/ full rule as one string) : 
    addRule( "#div1 { color:blue; width:100px; }", 3)
              [str]                              [num]
    
    */
    
    addRule : {
        value : function(selector, declaration, stylesheet, index) {
            stylesheet = stylesheet || this._defaultStylesheet;

            if(stylesheet === null) {
                stylesheet = this.defaultStylesheet = this.createStylesheet();
            }

            var rulesLength = this._defaultStylesheet.rules.length,
                argType     = (typeof declaration),
                ruleText    = selector,
                rule;

            index = index || (argType === 'number') ? declaration : rulesLength;
            
            if(argType === 'string') {
                ruleText += '{' + declaration + '}';
            } else if(argType === 'object') {
                ruleText += '{' + this.cssFromObject(declaration) + '}';
            }
            
            stylesheet.insertRule(ruleText, index);

            ///// Invalidate cache because rule dominance is affected
            this._clearCache();

            this.styleSheetModified(stylesheet);
            
            rule = stylesheet.rules[index];

            ///// attach specificity to rule object
            ///// if rule is css keyframes, return rule and don't attach specificity
            if (rule instanceof WebKitCSSKeyframesRule) {

                return rule;
            }
            rule[this.CONST.SPECIFICITY_KEY] = this.getSpecificity(rule.selectorText);

            ///// return the rule we just inserted
            return rule;
        }
    },
    
    ///// Create Override Rule
    ///// Takes a given rule and creates a rule with a selector of equal
    ///// or greater specificity, and inserts it after the original rule
    ///// This function will use a class to create the overriding selector,
    ///// and the class will have to be applied to the element in order for
    ///// the rule to stick
    ///// Returns an object containing this classname and the rule itself
    
    createOverrideRule : {
        value : function(ruleToOverride, element) {
            
            ///// Locally-scoped function to de-clutter variable declarations
            function getSelector(el, rule) {
                return this._getMostSpecificSelectorForElement(el, rule[this.CONST.SPECIFICITY_KEY]).selector;
            }

            var selectorToOverride = getSelector.bind(this)(element, ruleToOverride),
                overrideData, rule, isRuleLocked;

            isRuleLocked = this.isSheetLocked(ruleToOverride.parentStyleSheet);

            ///// Get the overriding selector and className
            overrideData = this.createOverrideSelector(selectorToOverride, element.nodeName, isRuleLocked);

            ///// Create new rule with selector and insert it after the rule we're overriding
            rule = this.addRule(overrideData.selector + ' { }', this.getRuleIndex(ruleToOverride)+1);
            
            return {
                className : overrideData.className,
                rule      : rule
            };
            
        }
    },

    createOverrideSelector : {
        value: function(selectorToOverride, classPrefix, increaseSpecificity, className) {
            var tokens = selectorToOverride.split(/\s/),
                newClass = className || this.generateClassName(classPrefix, true),
                lastToken, pseudoSplit, base, pseudo, newToken, newSelector;

            ///// Creating an overriding selector by replacing the last
            ///// class, attribute or type selector in passed-in rule's selector

            ///// Grab the last token
            lastToken   = tokens[tokens.length-1];
            pseudoSplit = lastToken.split(':');
            ///// The last token can have pseudo class. Let's preserve it
            base   = pseudoSplit[0];
            pseudo = (pseudoSplit[1]) ? ':'+pseudoSplit[1] : '';

            ///// Now, all we want to do is replace the last token with a
            ///// generated class name, except if the last token is an ID selector,
            ///// in which case we append the generated class name to the ID selector
            if(base.indexOf('#') !== -1) {
                newToken = base + '.' + newClass + pseudo;
            } else {
                if(increaseSpecificity) {
                    ///// Increases specificity by one class selector
                    ///// We'll do a direct append to the base class
                    ///// if we want to increase the specificity
                    newToken = base;
                } else {
                    ///// Maintains original specificity
                    ///// Replace last class or attribute selector
                    ///// Get everything right before the last class or attribute selector
                    ///// to support compound selector values: (i.e. .firstClass.secondClass)
                    newToken = base.substring(0, Math.max(base.lastIndexOf('.'), base.lastIndexOf('[')));
                }

                ///// Append the generated class
                newToken += '.' + newClass + pseudo;
            }

            ///// Now we can build the new selector by replacing the last token
            tokens[tokens.length-1] = newToken;
            newSelector = tokens.join(' ');

            return {
                className : newClass,
                selector  : newSelector
            };
        }
    },
    
    ///// Delete Rule
    ///// Deletes the passed-in rule from its stylesheet
    ///// Argument can be the index of the rule, or the rule itself
    ///// If the index is passed, the sheet must be passed in
    
    deleteRule : {
        value : function(rule, sheet) {
            var index;
            
            if(typeof rule === 'number') {
                ///// 1st arg is the index 
                index = rule;
            } else {
                ///// derive the index of the rule
                index = this.getRuleIndex(rule);
                ///// the sheet is a property of the rule
                sheet = rule.parentStyleSheet;
            }
            
            if(index > -1) {
                sheet.deleteRule(index);
            }

            this.styleSheetModified(sheet);

            return index;
        }
    },
    
    ///// Get Dominant Rule For Style
    ///// Given an element, this method returns the dominant rule 
    ///// for the particular style property.
    ///// Optionally, it returns an override object if no single-target
    ///// rule is found.
    ///// An override object consists of a rule to override, and a
    ///// flag for using !important or not
    
    getDominantRuleForElement : {
        value : function(element, property, returnOverrideObject, useStageStyleSheet) {
            var matchedRules = this.getMatchingRules(element, true, useStageStyleSheet),
                doc          = element.ownerDocument,
                useImportant = false,
                inLineStyleRule, rulesWithProperty, importantRules, dominantRule;
                
                ///// First, since an element's style attribute is a CSSStyleDeclaration
                ///// and not a CSSStyleRule, we want to create an imitation rule object
                ///// to act like any returned by getMatchedCSSRules
                inLineStyleRule = {
                    isInlineStyle : true,
                    style         : element.style
                };

                ///// Now splice it into the matched rules
                ///// By inserting the inline style at the beginning,
                ///// we keep the correct order of specificity
                matchedRules.splice(0, 0, inLineStyleRule);

                ///// Now, let's see which of these rules defines the property
                ///// or shorthand
                rulesWithProperty = matchedRules.filter(function(rule) {
                    return this.hasProperty(rule, property, true);
                }, this);

                //debugger;
                /* POST-FILTERING for property

                At this point, we have (in order of selector specificity) either
                    1) 1 or more rules with property
                        - Get subset of rules with "!important" flag on property
                            - Of these, we choose the first in the list (highest specificity, ever! jk)
                            - Does it affect multiple elements? If yes, create override
                        - None have "!important" flag - use initial list of rules with property
                        - Get
                    2) No rules with the property (i.e., no chance of property collision)
                     - use the original rule list to find the most specific, single-target rule
                        - start with the highest specificity to minimize calls to querySelectorAll() 
                     - if there is no single-target rule, create a new rule to apply this style

                */

                ///// Is the property defined anywhere?
                if(rulesWithProperty.length > 0) {

                    ///// Ok, we've got rule(s) with the property.
                    ///// Let's look for the properties with !important
                    importantRules = rulesWithProperty.filter(function(rule) {
                        return !!rule.style.getPropertyPriority(property);
                    });

                    if(importantRules.length) {
                        useImportant = true;
                        //dominantRule = this._getFirstSingleTargetRule(importantRules, doc);
                        dominantRule = importantRules[0];
                    } else {
                        //dominantRule = this._getFirstSingleTargetRule(rulesWithProperty, doc);
                        dominantRule = rulesWithProperty[0];
                    }
                    
                } else { // no rules with property
                    ///// In this case, we don't want to use the inline style
                    ///// Important flag is irrelevant because the style property isn't defined
                    //dominantRule = this._getFirstSingleTargetRule(matchedRules.slice(1), doc);
                    return this._getFirstSingleTargetRule(matchedRules.slice(1), doc);
                }

                if(this.matchesMultipleElements(dominantRule, doc) && returnOverrideObject) {
                    ///// Oh, darn, we didn't find a single-target rule!
                    ///// We can return the required data to create an override
                    ///// rule to the calling method
                    return {
                        useImportant   : useImportant,
                        ruleToOverride : dominantRule,
                        singleTargetBackup : this._getFirstSingleTargetRule(matchedRules.slice(1), doc)
                    };
                }
                
                return dominantRule;
        }
    },

    ///// Get Dominant Rule For Group
    ///// Given an array of elements, this function will return the dominant rule
    ///// for a given property. If no one rule exists which will allow for the
    ///// style to apply to the element, an override object will be returned,
    ///// from which an overriding rule can be created.

    getDominantRuleForGroup : {
        value : function(elements, property, forceOverride) {
            var selectorsToOverride = [],
                commonRules, dominantRules, useImportant;

            ///// Get the common rules for all elements
            commonRules = this.getCommonRules(elements);

            ///// Find which rules target ONLY the elements passed in
            ///// I.E. passed-in elements are not a sub-selection of rule's target
            commonRules = commonRules.filter(function(rule) {
                return this.matchesElementsExclusively(rule, elements);
            }, this);

            ///// OK, now if we still have common rules, we must determine if
            ///// this is the appropriate rule for to apply the style property to each
            ///// element.

            ///// This means we have to determine the dominant rules for each element for
            ///// the style property in question, and ensure that the common rule has
            ///// higher specificity, and if not, create an overriding rule.

            elements.forEach(function(el) {
                var dominantRule = this.getDominantRuleForElement(el, property), selector;

                if(dominantRule && this.hasProperty(dominantRule, property, true)) {
                    ///// ok, we've got the dominant rule with the property

                    ///// for this rule, we only care about the selector
                    ///// which has the highest specificity and targets the element
                    ///// (and, inline styles don't have selectors, so )
                    if(!dominantRule.isInlineStyle) {
                        selector = this._getMostSpecificSelectorForElement(el, dominantRule[this.CONST.SPECIFICITY_KEY]);
                        selectorsToOverride.push(selector);
                    }

                    ///// TODO: write hasImportant method which can also check for shorthand properties
                    if(!useImportant && (dominantRule.style.getPropertyPriority(property) || dominantRule.isInlineStyle)) {
                        useImportant = true;
                    }

                }
            }, this);

            ///// if any of the selectors
            if(commonRules.length) {
                selectorsToOverride.filter(function(selectorObj) {

                }, this);
            }


        }
    },

    ///// Disable Rule
    ///// Disables a rule by giving it a known garbage selector
    
    disableRule : {
        value : function(rule, sheet) {
            rule = (typeof rule === 'number') ? sheet.rules[rule] : rule;
            
            rule.selectorText += this.CONST.GARBAGE_SELECTOR;
            
            return rule;
        }
    },
    
    ///// Enable Rule
    ///// Enables a rule by removing the known garbage selector
    
    enableRule : {
        value : function(rule, sheet) {
            rule = (typeof rule === 'number') ? sheet.rules[rule] : rule;
            
            ///// remove any occurances of the garbage selector
            rule.selectorText.replace(this.CONST.GARBAGE_SELECTOR, '');
            
            return rule;
        }
    },
    
    ///// Has Property
    ///// Checks to see if a rule has the property defined in
    ///// its declaration.
    ///// Optionally checks for shortand property
    
    hasProperty : {
        value: function(rule, property, checkForShorthand) {
            var properties = [property],
                shorthands = cssShorthandMap[property];
            
            ///// If shorthand properties are defined, add to the array
            ///// of which properties to check for
            if(shorthands) {
                properties.concat(shorthands);
            }
            
            ///// return true if any property exists in rule
            return properties.some(function(prop) {
                return !!rule.style.getPropertyValue(prop);
            }, this);
            
        }
    },
    
    ///// Matches Multiple Elements
    ///// Checks to see if the rule affects multiple elements
    
    matchesMultipleElements : {
        value: function(rule, document) {
            if(rule.isInlineStyle) {
                return true;
            }

            var doc = document || this._currentDocument;
            ///// TODO: somehow cache the number of elements affected
            ///// by the rule, because querySelectorAll() is expensive
            return !!(doc.querySelectorAll(rule.selectorText).length > 1);
        }
    },

    ///// Matches Elements Exclusively
    ///// Checks to see if passed-in rule targets ONLY the elements
    ///// passed in.

    matchesElementsExclusively : {
        value : function(rule, elements) {
            var doc = elements[0].ownerDocument;

            ///// find all targets of rule's selector,
            ///// if any target is not in passed-in array, return false
            return nj.toArray(doc.querySelectorAll(rule.selectorText)).every(function(el) {
                return elements.indexOf(el) !== -1;
            });

        }
    },
    
    
    ///// Set Rule Selector
    ///// Allows user to change the selector of given rule
    ///// while attaching new specificity value to rule object
    
    setRuleSelector : {
        value : function(rule, selector) {
            rule.selectorText = selector;
            rule[this.CONST.SPECIFICITY_KEY] = this.getSpecificity(selector);

            this.styleSheetModified(rule.parentStyleSheet);

            return rule;
        }
    },
    
    ///// Get Rule Index
    ///// Returns the index of the passed-in rule.
    ///// Returns -1 if not found.
    ///// A rule's index is useful to know for deleting, inserting
    ///// and determining rule precedence
    
    getRuleIndex : {
        value : function(rule) {
            var rules = nj.toArray(rule.parentStyleSheet.rules);

            return rules.indexOf(rule);
        }
    },

    _getRuleWithCSSText : {
        value: function(cssText, doc) {
            var _doc = doc || this.currentDocument.model.views.design._document,
                ruleIndex, rule;

            for(var i = 0; i < _doc.styleSheets.length; i++) {
                ruleIndex = nj.toArray(_doc.styleSheets[i].rules).map(function(rule) {
                    return rule.cssText;
                }).indexOf(cssText);

                if(ruleIndex !== -1) {
                    rule = _doc.styleSheets[i].rules[ruleIndex];
                    break;
                }
            }

            if(!rule) {
                ///// This should never be hit if providing cssText from existing rule (like those
                ///// returned from getMatchedCSSRules()
                console.warn('StylesController::_getRuleWithCSSText - No rule found with given cssText.');
            }

            return rule;
        }
    },

    ///// Get All Matching Rules
    ///// Returns an array of css rules for an element
    ///// Optionally sorted by specificity, and can omit pseudo elements
    
    getMatchingRules : {          //TODO: Remove omitPseudos from here and usages
        value: function(element, omitPseudos, useStageStyleSheet) {
            var rules,
                mappedRules,
                doc = element.ownerDocument,
                win = doc.defaultView;

            try {
                mappedRules = nj.toArray(win.getMatchedCSSRules(element)).map(function(rule) {
                    return this._getRuleWithCSSText(rule.cssText, doc);
                }, this);

                rules = mappedRules.filter(function(rule) {
                    //// useStageStyleSheet flag indicates whether to only return rules from the stylesheet,
                    //// or only use rules for other stylesheets

                    var sheetId = (rule.parentStyleSheet) ? rule.parentStyleSheet.ownerNode.id : null,
                        isStageStyleSheet = sheetId === this.CONST.STAGE_SHEET_ID;

                    ///// filter out (return false) depending on flag
                    if(useStageStyleSheet && !isStageStyleSheet) { return false; }
                    if(!useStageStyleSheet && isStageStyleSheet) { return false; }

                    ///// Non-filter code - just assigning specificity to the rule
                    if(!rule[this.CONST.SPECIFICITY_KEY]) {
                        rule[this.CONST.SPECIFICITY_KEY] = this.getSpecificity(rule.selectorText);
                    }

                    return true;

                }, this);

            } catch(ERROR) {
                console.warn('StylesController::getMatchingRules - Un-attached element queried.');
            }
            ///// Function for sorting by specificity values
            function sorter(ruleA, ruleB) {
                var a, b, order, sheetAIndex, sheetBIndex, ruleAIndex, ruleBIndex;


                ///// get the specificity arrays
                a = this._getMostSpecificSelectorForElement(element, ruleA[this.CONST.SPECIFICITY_KEY]);
                b = this._getMostSpecificSelectorForElement(element, ruleB[this.CONST.SPECIFICITY_KEY]);

                ///// use the most specific selectors (first in arrays),
                ///// determine whether the selector applies to the element
                ///// if not, move on to
                order = this.compareSpecificity(a.specificity, b.specificity);

                if(order === 0) {
                    //debugger;
                    /// Tie. Sway one way or other based on stylesheet/rule order
                    sheetAIndex = nj.toArray(win.document.styleSheets).indexOf(ruleA.parentStyleSheet);
                    sheetBIndex = nj.toArray(win.document.styleSheets).indexOf(ruleB.parentStyleSheet);
                    /// If tied again (same sheet), determine which is further down in the sheet
                    if(sheetAIndex === sheetBIndex) {
                        ruleAIndex = this.getRuleIndex(ruleA); ruleBIndex = this.getRuleIndex(ruleB);
                        return ruleAIndex < ruleBIndex ? 1 : (ruleAIndex > ruleBIndex) ? -1 : 0;
                    } else {
                        return sheetAIndex < sheetBIndex ? 1 : (sheetAIndex > sheetBIndex) ? -1 : 0;
                    }
                }

                return order;
            }
            
            rules.sort(sorter.bind(this));
            
            return rules;
        }
    },
    
    ///// Get Common Rules
    ///// Returns an array of rules that are common to all the elements
    ///// in passed-in element array.
    
    getCommonRules : {
        value : function(elements) {
            var itemIndex = -1,
                currentEl, currentRuleList, nextEl, nextRuleList, commonRules;

            do {
                ///// Get current element's matched rules
                currentEl = elements[++itemIndex];
                currentRuleList = this.getMatchingRules(currentEl, true);

                ///// Get next element's matched rules
                nextEl = elements[itemIndex+1];
                nextRuleList = this.getMatchingRules(nextEl, true);

                ///// use filter to see if any rules exist in the next set of rules
                commonRules = currentRuleList.filter(function(rule) {
                    return nextRuleList.indexOf(rule) !== -1;
                });

            } while (itemIndex+2 < elements.length && commonRules.length > 0);

            return commonRules;
        }
    },
    
    ///// Get Most Specific Selector For Element
    ///// Given a selector+specificity array, find the most specific
    ///// selector for the passed-in element
    
    _getMostSpecificSelectorForElement : {
        value : function(element, specArr) {
            if(specArr.length === 1) { 
                return specArr[0];
            }
            
            var matchingElements, i;

            for(i = 0; i < specArr.length; i++) {
                matchingElements = element.ownerDocument.querySelectorAll(specArr[i].selector);
                if(nj.toArray(matchingElements).indexOf(element) !== -1) {
                    return specArr[i];
                }
            }
            ///// reached end of specificity array with no match - should be impossible
            console.error('StylesController::_getMostSpecificSelectorForElement - no matching selectors in specificity array.');
        }
    },


    ///// Has Greater Specificity
    ///// A method that returns true if the first argument has higher
    ///// specificity than the second argument
    ///// An element has to be supplied to determine which selector
    ///// to evaluate within grouped selectors
    hasGreaterSpecificity : {
        value: function(rule1, rule2, element) {
            var a = this._getMostSpecificSelectorForElement(element, rule1[this.CONST.SPECIFICITY_KEY]),
                b = this._getMostSpecificSelectorForElement(element, rule2[this.CONST.SPECIFICITY_KEY]),
                win = element.ownerDocument.defaultView,
                order, sheetAIndex, sheetBIndex, ruleAIndex, ruleBIndex;

              order = this.compareSpecificity(a.specificity, b.specificity);

            if(order === 0) {
                 /// Tie. Sway one way or other based on stylesheet/rule order
                 sheetAIndex = nj.toArray(win.document.styleSheets).indexOf(rule1.parentStyleSheet);
                 sheetBIndex = nj.toArray(win.document.styleSheets).indexOf(rule2.parentStyleSheet);
                 /// If tied again (same sheet), determine which is further down in the sheet
                if(sheetAIndex === sheetBIndex) {
                     ruleAIndex = this.getRuleIndex(rule1); ruleBIndex = this.getRuleIndex(rule2);
                   return ruleAIndex < ruleBIndex ? false : (ruleAIndex > ruleBIndex) ? true : false;
                 } else {
                     return sheetAIndex < sheetBIndex ? false : (sheetAIndex > sheetBIndex) ? true : false;
                }
             }

            return (order < 0);

        }
     },

    
    ///// Get First Single Target Rule
    ///// Loops through the array of rules sequentially, returning the first
    ///// single-target rule (i.e. first rule which affects only one element)
    ///// Returns null if no single target rule is found
    
    _getFirstSingleTargetRule : {
        value : function(rules, document) {
            var i;
            for(i = 0; i < rules.length; i++) {
                if(!this.matchesMultipleElements(rules[i], document)) {
                    return rules[i];
                }
            }
            return null;
        }
    },
    
    ///// Compare Specificity
    ///// Takes two specificity objects and returns:
    ///// -1 if first is more specific than second
    ///// +1 if second is more speficic than first
    ///// 0 if equal in specificity
    
    compareSpecificity : {
        value : function(a, b) {
            var specA = a,
                specB = b,
                order;
                
            [this.CONST.SPEC_ID_KEY,this.CONST.SPEC_CLASS_KEY,this.CONST.SPEC_TYPE_KEY].some(function(t) {
                    order = specA[t] < specB[t] ? 1 : (specA[t] > specB[t]) ? -1 : 0;
                    return order !== 0;
            }, this);
            
            return order;
        }
    },
    
    ///// Get specificity
    ///// Creates array of objects, ordered by specificity for each 
    ///// selector in the passed-in selectorText.
    
    getSpecificity : {
        value : function(selector) {
            var arr = selector.split(',').map(function(sel) {
                return {
                    selector : sel,
                    specificity : this.calculateSpecificity(sel)
                };
            }, this);
            
            ///// now sort by specificity
            return arr.sort(function(a, b) {
                return this.compareSpecificity(a.specificity, b.specificity);
            }.bind(this));
        }
    },
    
    ///// Calculate specificity
    ///// Returns the specificity value of passed-in selector
    ///// WARNING: Do not pass in grouped selectors!
    ///// Helpful for determining precedence of style rules
    ///// Calculation javascript code courtesy of Graham Bradley:
    ///// http://gbradley.com/2009/10/02/css-specificity-in-javascript
    ///// Used with author's permission

    calculateSpecificity : {
        value : function(selector) {
            var s   = selector.replace(/\([^\)]+\)/,''),
                obj = {};
            
            ///// function for counting matches for different
            ///// selector patterns
            function m(reg) {
                var matches = s.match(reg);
                return matches ? matches.length : 0;
            }
            
            obj[this.CONST.SPEC_ID_KEY]    = m(/#[\d\w-_]+/g);         /// match id selector
            obj[this.CONST.SPEC_CLASS_KEY] = m(/[\.:\[][^\.:\[+>]+/g); /// match class selector
            obj[this.CONST.SPEC_TYPE_KEY]  = m(/(^|[\s\+>])\w+/g);     /// match tag selector
            
            return obj;
        }
    },
    
    /* ----------------- Style methods ----------------- */
    
    ///// Add style
    ///// Set style property and value on provided rule
    ///// with optional priority (!important)
    ///// Returns the browser's value of passed-in property
    
    setStyle : {
        value: function(rule, property, value, useImportant) {
            var dec = rule.style, priority;
            
            ///// Remove property for passive validation (sets it to null)
            dec.removeProperty(property);
            
            priority = (useImportant) ? this.IMPORTANT_FLAG : null;

            ///// Use CSS declaration's setProperty()
            ///// method to apply/test the new value
            dec.setProperty(property, value, priority);

            if(rule.type !== 'inline' && rule.parentStyleSheet) {
                this.styleSheetModified(rule.parentStyleSheet);
            }

            ///// Return browser value for value we just set
            return dec.getPropertyValue(property);
        }
    },
    
    ///// Add styles
    ///// Set multiple styles on provided rule
    ///// Returns a collection of browser values for the
    ///// passed-in properties
    
    setStyles : {
        value: function(rule, styles, useImportant) {
            var browserValues = {}, property, value;
            
            for(property in styles) {
                if(styles.hasOwnProperty(property)) {
                    value = styles[property];
                    browserValues[property] = this.setStyle(rule, property, value, useImportant);
                }
            }
            
            return browserValues;
        }
    },

    ///// Set Keyframe Style
    ///// For a given CSSKeyframesRule, we may add a style to the keyframe at
    ///// given index.

    setKeyframeStyle : {
        value : function(rule, keyframeIndex, property, value, useImportant) {
            return this.setStyle(rule.cssRules[keyframeIndex], property, value, useImportant);
        }
    },

    ///// Set Keyframe Styles
    ///// For a given CSSKeyframesRule, we may add styles to the keyframe at
    ///// given index.

    setKeyframeStyles : {
        value : function(rule, keyframeIndex, property, value, useImportant) {
            return this.setStyles(rule.cssRules[keyframeIndex], property, value, useImportant);
        }
    },

    insertKeyframe : {
        value : function() {

        }
    },

    ///// Get Animation Rule With Name
    ///// Returns the CSSKeyframesRule with given name

    getAnimationRuleWithName : {
        value: function(name, document) {
            var doc = document || this._currentDocument.model.views.design.document,
                animRules = this.getDocumentAnimationRules(doc),
                rule, i;

            for(i = 0; i < animRules.length; i++) {
                rule = animRules[i];
                if(rule.name === name) {
                    return rule;
                }
            }

            return;
        }
    },

    ///// Get Document Animation Rules
    ///// Returns all CSSKeyframesRules in active document, or in
    ///// optionally passed-in document
    ///// If none are found, returns an empty array

    getDocumentAnimationRules : {
        value: function(document) {
            var sheets = (document) ? document.styleSheets : this._currentDocument.model.views.design.document.styleSheets,
                rules = [];

            nj.toArray(sheets).forEach(function(sheet) {
                rules = rules.concat(this.getStyleSheetAnimationRules(sheet));
            }, this);

            return rules;
        }
    },

    ///// Get Style Sheet Animation Rules
    ///// Returns all CSSKeyframesRules from the given stylesheet
    ///// If none are found, returns an empty array

    getStyleSheetAnimationRules : {
        value: function(sheet) {
            var rules = [];

            if(sheet.rules) {
                rules = rules.concat(nj.toArray(sheet.rules).filter(function(rule) {
                    return rule instanceof WebKitCSSKeyframesRule;
                }));
            }

            return rules;
        }
    },

    ///// Delete style
    ///// Removes the property from the style declaration/rule
    ///// Returns the rule
    
    deleteStyle : {
        value : function(rule, property) {
            this.styleSheetModified(rule.parentStyleSheet);

            rule.style.removeProperty(property);

            return rule;
        }
    },
    
    ///// Delete styles
    ///// Removes all style properties in passed-in array or object
    ///// Returns the rule
    
    deleteStyles : {
        value : function(rule, properties) {
            if(properties.constructor !== Array && typeof properties === 'object') {
                properties = Object.keys(properties);
            }
            
            properties.forEach(function(prop) {
                this.deleteStyle(rule, prop);
            }, this);
            
            return rule;
        }
    },
    
    /* ----------------- Element methods ----------------- */
    
    ///// Set Element Style
    ///// Applies style to element via dominant rule logic:
    
    ///// We find the most specific rule that has the style property (or it's shorthand)
    ///// and does not affect multiple elements (we don't want to change that style on
    ///// all elements sharing a class, for example).
    
    ///// Here there are a few possibilities:
    ///// 1) We find the most specific, single-target matching rule with the property defined
    /////    - Great! Set the style on it.
    ///// 2) The style property is defined in a multi-target rule
    /////    - if there's an single-target rule with greater specificity, use it instead
    /////    - else, create rule using the multi-target rule's selector, but replace the
    /////    - last piece of the selector (.class, or 'div') with a new class, which should
    /////    - be appended to the element. Use this new rule to add the style property
    /////    - NOTE: Doing this ensures the new rule has equal or greater specificity,
    /////    - and as long as it is inserted after the original rule, we're good.
    ///// 3) The style property is not defined anywhere
    /////    - use most specific, single-target rule
    /////    - else (this means no single-target rule matches element), create a class
    /////    - for this element
    
    
    ///// For Undo/Redo: should return object detailing what actually happened
    ///// during the application of the style (created rule or amended rule)
    
    setElementStyle : {
        value : function(element, property, value, isStageElement) {
            var doc = element.ownerDocument,
                useImportant = false,
                cache = this._getCachedRuleForProperty(element, property),
                dominantRule, override, className, browserValue, cacheMatchesMany;

            if(cache) {
                ///// We've cached the rule for this property!
                //console.log('Styles Controller :: setElementStyle - We found the cached rule!');
                dominantRule = cache;
                cacheMatchesMany = this.matchesMultipleElements(dominantRule, doc);
            } else {
                ///// Use Dominant Rule logic to find the right place to add the style
                ///// Pass "true" to method to return an override object, which
                ///// has the rule to override, and whether the !important flag is needed
                dominantRule = this.getDominantRuleForElement(element, property, true, isStageElement);

            }

            if(cacheMatchesMany) {
                dominantRule = this.getDominantRuleForElement(element, property, true, isStageElement);
            }

            ///// Did we find a dominant rule?
            if(!dominantRule) {
                ///// No. This means there was no rule with this property, and no
                ///// single-target rule we can use to add the style to.
                ///// There's is no chance of colliding with another rule, so we
                ///// create a new rule (class), and append it to the element
                className = this.generateClassName(element.nodeName);
                dominantRule = this.addRule('.'+className + '{}');
                this.addClass(element, className);
                
            } else if(dominantRule.ruleToOverride) {
                ///// Do we have to override a rule?
                ///// Well, let's first see if a higher-specificity, single-target
                ///// rule exists
                if(dominantRule.singleTargetBackup && this.hasGreaterSpecificity(dominantRule.singleTargetBackup, dominantRule.ruleToOverride, element)) {
                    dominantRule = dominantRule.singleTargetBackup;
                } else {
                    ///// No. The override object has the rule we need to override
                    override = this.createOverrideRule(dominantRule.ruleToOverride, element);
                    useImportant = dominantRule.useImportant;
                    dominantRule = override.rule;
                    this.addClass(element, override.className);
                }
            }


            ///// set style method will return the value used by the browser after parsing
            browserValue = this.setStyle(dominantRule, property, value, useImportant);

            ///// Only cache the dominant rule if the style value was valid, and not already cached
            if(browserValue && (!cache || cacheMatchesMany)) {
                this._setCachedRuleForProperty(element, property, dominantRule);
            }

            return browserValue;
        }
    },

    setGroupStyle : {
        value : function(elements, property, value) {
            var doc = elements[0].ownerDocument,
                useImportant = false,
                dominantRules;

            dominantRules = elements.map(function(el) {
                return this.getDominantRuleForElement(el, property, true);
            }, this);



        }
    },

    ///// Set Element Styles
    ///// Applies passed-in styles to the element via dominant rule logic
    ///// Styles must be in object format with the property as the key
    
    setElementStyles : {
        value : function(element, styles, isStageElement) {
            for(var property in styles) {
                if(styles.hasOwnProperty(property)) {
                    this.setElementStyle(element, property, styles[property], isStageElement);
                }
            }
        }
    },

    setGroupStyles : {
        value : function(elements, styles) {
            var properties = Object.keys(styles),
                newClass = this.generateClassName(null, true),
                selectors;

            ///// TODO: move this: Locally-scoped function to de-clutter variable declarations
            function getSelector(el, rule) {
                return this._getMostSpecificSelectorForElement(el, rule[this.CONST.SPECIFICITY_KEY]).selector;
            }

            selectors = elements.map(function(el) {
                ///// for each element, we want to find the most specific selector
                var matchingRules = this.getMatchingRules(el, true);

                this.addClass(el, newClass);

                if(matchingRules.length === 0) {
                    return null;
                }

                var mostSpecificRule = matchingRules[0], // TODO: iterate over properties to find most specific
                    selectorToOverride = getSelector.bind(this)(el, mostSpecificRule),
                    override = this.createOverrideSelector(selectorToOverride, null, newClass);

                return override.selector;

            }, this);

            selectors.filter(function(item) {
                return item !== null;
            });

            this.addRule(selectors.join(', '), styles);
        }
    },
    
    ///// Get Element Style
    ///// Gets the style value that is currently applied to the element
    ///// Uses Dominant Rule logic to determine the rule that has the property
    ///// and if not found, can optionally return the computed style instead of
    ///// null.
    
    getElementStyle : {
        value : function(element, property, fallbackOnComputed, isStageElement) {
            var cache = this._getCachedRuleForProperty(element, property),
                dominantRule = cache || this.getDominantRuleForElement(element, property, false, isStageElement),
                value = (dominantRule) ? dominantRule.style.getPropertyValue(property) : null;
            //console.log('Getting element style for: "' + property + '"');
            if(value) {
                ///// if the dominant rule with the property defined was found, cache the rule (if not already cached)
                if(!cache) {
                    this._setCachedRuleForProperty(element, property, dominantRule);
                }
            } else if(fallbackOnComputed) {
                ///// The dominant rule might not have the style property defined - why?
                ///// If no rules have the property defined, we can use the
                ///// most-specific single-target rule as the dominant rule (for setting styles)
                return (element.ownerDocument.defaultView ? element.ownerDocument.defaultView.getComputedStyle(element).getPropertyValue(property) : null);
            }

            return value;
        }
    },

    ///// Get Element Animation Rule
    ///// Returns the CSSKeyframesRule applied to an element

    getElementAnimationRule : {
        value: function(element) {
            var animationName = this.getElementStyle(element, '-webkit-animation-name');

            if(!animationName) {
                return null;
            }

            return this.getAnimationRuleWithName(animationName);
        }
    },

    ///// Get Matrix From Element
    ///// Returns the matrix from an element's -webkit-transform
    //// TODO - This routine should eventually check for other transform styles, i.e., rotateX, translateZ, etc.

    getMatrixFromElement : {
        value: function(element, isStage) {
            isStage = false;
            var xformStr = this.getElementStyle(element, "-webkit-transform", true, isStage),
                mat;

            if (xformStr) {
                var index1 = xformStr.indexOf( "matrix3d(");
                if (index1 >= 0) {
                    index1 += 9;    // do not include 'matrix3d('
                    var index2 = xformStr.indexOf( ")", index1 );
                    if (index2 >= 0) {
                        var substr = xformStr.substr( index1, (index2-index1));
                        if (substr && (substr.length > 0)) {
                            var numArray = substr.split(',');
                            var nNums = numArray.length;
                            if (nNums == 16) {
                                // gl-matrix wants row order
                                mat = numArray;
                                for (var i=0;  i<16;  i++) {
                                    mat[i] = Number( mat[i] );
                                }
                            }
                        }
                    }
                }
            }
            return mat;
        }
    },

    ///// Get Perspective Distance From Element
    ///// Returns the perspective from an element's -webkit-transform

    getPerspectiveDistFromElement : {
        value: function(element, isStage) {
            isStage = false;
            var xformStr = this.getElementStyle(element, "-webkit-perspective", false, isStage),
                dist;

            if(xformStr) {
                dist = parseInt(xformStr);
            } else {
                xformStr = this.getElementStyle(element, "-webkit-transform", true, isStage);
                if (xformStr) {
                    var index1 = xformStr.indexOf( "perspective(");
                    if (index1 >= 0) {
                        index1 += 12;    // do not include 'perspective('
                        var index2 = xformStr.indexOf( ")", index1 );
                        if (index2 >= 0) {
                            var substr = xformStr.substr( index1, (index2-index1));
                            if (substr && (substr.length > 0)) {
                                dist = parseInt( substr );
                            }
                        }
                    }
                }
            }
            if(isNaN(dist)) {
                return "none";
            } else {
                return dist;
            }
        }
    },

    ///// Create Rule From Inline Style
    ///// Creates a rule for an inline style with a specified, or partially random selector.

    createRuleFromInlineStyle : {
        value : function(element, selector, makeDominant) {
            var declaration = element.style, rule;

            if(makeDominant) {
                ///// iterate through declaration and set Element Style
                nj.toArray(declaration).forEach(function(prop) {
                    this.setElementStyle(element, prop, declaration.getPropertyValue(prop));
                }, this);

            } else {
                rule = this.addRule(selector || '.'+this.generateClassName(element.nodeName), element.getAttribute('style'));
            }

            return rule;
        }
    },
    
    ///// Add Class
    ///// Adds class to element
    
    addClass : {
        value : function(element, className) {
            element.classList.add(className);
        }
    },
    
    /* ----------------- Stylesheet methods ----------------- */
    
    ///// Create a stylesheet via style tag in active document, or
    ///// optionally passed-in document
    
    createStylesheet : {
        value: function(id, document) {
            var doc = document || this._currentDocument.model.views.design.document,
                sheetElement, sheet;
            
            sheetElement = nj.make('style', {
                type  : 'text/css',
                rel   : 'stylesheet',
                id    : id || "",
                media : 'screen',
                title : 'Temp'
            });

            doc.head.appendChild(sheetElement);
            sheet = this.getSheetFromElement(sheetElement, doc);

            this.userStyleSheets.push(sheet);

            this.styleSheetModified(sheet);

            NJevent('newStyleSheet', sheet);

            return sheet;
        }
    },

    ///// Remove Style sheet
    ///// Removes style sheet from document

    removeStyleSheet : {
        value: function(sheet) {
            var sheetEl = sheet.ownerNode, sheetCount;

            if(sheetEl) {
                sheetEl.disabled = true;
                this.userStyleSheets.splice(this.userStyleSheets.indexOf(sheet), 1);

                ///// Check to see if we're removing the default style sheet
                if(sheet === this._defaultStylesheet) {
                    sheetCount = this.userStyleSheets.length;
                    this.defaultStylesheet = (sheetCount) ? this.userStyleSheets[sheetCount-1] : null;
                }

                ///// Mark for removal for i/o
                sheetEl.setAttribute('data-ninja-remove', 'true');

                NJevent('removeStyleSheet', sheet);
            }


        }
    },
    
    ///// Gets the stylesheet object associated with passed-in
    ///// element or element id, with option context (document)
    ///// (For <link> and <style> tags)
    
    getSheetFromElement : {
        value : function(element, context) {
            var doc = context || this._currentDocument.model.views.design.document,
                el  = (typeof element === 'string') ? nj.$(element, doc) : element;
                
            if(el && el.sheet) {
                return el.sheet;
            }
        }
    },

    isSheetLocked : {
        value: function(sheet) {
            return !!sheet.ownerNode.dataset['ninjaFileReadOnly'];
        }
    },

    ///// Style Sheet Modified
    ///// Method to call whenever a stylesheet change is made
    ///// Dispatches an event, and keeps list of dirty style sheets

    styleSheetModified : {
        value: function(sheet, eventData) {
            var sheetSearch = this.dirtyStyleSheets.filter(function(sheetObj) {
                return sheetObj.stylesheet === sheet;
            });

            ///// Dispatch modified event
            NJevent('styleSheetModified', eventData);
            this.currentDocument.model.needsSave = true;

            ///// If the sheet doesn't already exist in the list of modified
            ///// sheets, dispatch dirty event and add the sheet to the list
            if(sheetSearch.length === 0) {
                this.dirtyStyleSheets.push({
                    document : sheet.ownerNode.ownerDocument,
                    stylesheet : sheet
                });
            }
        }
    },

    ///// Dirty Style Sheets
    ///// List of modified style sheets

    dirtyStyleSheets : {
        value : []
    },

    ///// Clear Dirty Style Sheets
    ///// Refreshes the list of dirty style sheets
    ///// If optional document object is supplied, only the styles sheets
    ///// of a particular document are cleared
    ///// Useful to call after a "Save" or "Save All" event

    clearDirtyStyleSheets : {
        value: function(doc) {
            this.dirtyStyleSheets.length = 0;

            if(doc) {
                this.dirtyStyleSheets = this.dirtyStyleSheets.filter(function(sheet) {
                    return sheet.document !== doc;
                });
            } else {
                this.dirtyStyleSheets = [];
            }


        }
    },

    /* ----------------- Utils ------------------- */

    _generateRandomAlphaNumeric : {
        value : function(length) {
            var available = 'abcdefghijklmnopqrstuvwxyz0123456789',
                len = length || 4,
                chars = [], i;
                
            for(i = 0; i<len; i++) {
                chars[i] = available[Math.floor(Math.random() * available.length)];
            }
                
            return chars.join('');
        }
    },
    
    ///// Generate Class Name
    ///// Returns class name using optional passed-in prefix or default class name
    ///// prefix, and randomly created string
    ///// If creating a class name for a group, pass in true to second argument
    ///// and a different default class prefix will be used (better semantics)
    
    generateClassName : {
        value : function(prefix, forGroup) {
            var className;

            if(prefix) {
                className = prefix;
            } else {
                className = (forGroup) ? this.CONST.GENERATED_GROUP_CLASS : this.CONST.GENERATED_CLASS;
            }

            return className.toLowerCase() + '-' + this._generateRandomAlphaNumeric();
        }
    },

    ///// CSS From Object
    ///// Returns css text from object with key/value pairs
    ///// representing css styles

    cssFromObject : {
        value : function(obj) {
            var cssText = '';
            ///// For each key/value pair, create css text
            for(var prop in obj) {
                cssText += prop + ':' + obj[prop] + ';';
            }
            return cssText;
        }
    },

    /* ----------------- Element model (rule cache) related methods ----------------- */

    ///// Get Cached Rule For Property
    ///// Returns the cached rule for the style property

    _getCachedRuleForProperty : {
        value : function(el, property) {
            if(!el.elementModel) { return false; } /// return false if there is no element model

            return el.elementModel[property];
        },
        enumerable : false
    },

    ///// Set Cached Rule For Property
    ///// Sets the cached rule for the style property
    ///// Returns false if the element model doesn't exist

    _setCachedRuleForProperty : {
        value: function(el, property, rule) {
            if(!el.elementModel) { return false; } /// return null if there is no element model

            this._cacheHistory.push({
                rule: rule,
                element: el,
                property: property
            });

            el.elementModel[property] = rule;
            return true;
        },
        enumerable: false
    },

    ///// Cache History
    ///// Keeps a log of all cached rules on elements
    ///// This array can be used to nullify cached rules when
    ///// CSS rule changes happen

    _cacheHistory : {
        value: []
    },

    ///// Clear Cache
    ///// Nullifies all cached CSS rules on the element provided, or
    ///// on the entire cache history

    _clearCache: {
        value: function(element) {
            var itemsToNullify = this._cacheHistory,
                itemsToRemove = [],
                i;


            ///// If clearing the cache for an element, filter by element
            ///// and keep track of indices to remove from cache
            if(element) {
                itemsToNullify = itemsToNullify.filter(function(item, index) {
                    if(item.element === element) {
                        itemsToRemove.push(index);
                        return true;
                    }
                    return false;
                });
            }

            itemsToNullify.forEach(function(item) {
                //var identifier = item.element.nodeName;
                //identifier += '#'+item.element.id || '.'+item.element.className;
                //console.log("clearing cache for \"" + item.property +"\" and element \"" + identifier+ "");
                if(item.element.elementModel) {
                    item.element.elementModel[item.property] = null;
                }
            });

            ///// Remove the nullified items from the cache
            ///// Start at the end to not mess up index references
            for(i = itemsToRemove.length-1; i >= 0; i--) {
                this._cacheHistory.splice(itemsToRemove[i], 1);
            }

            if(!element) {
                this._cacheHistory = null;
                this._cacheHistory = [];
            }

        }
    },
    _removeCachedRuleForProperty : {
        value: function() {

        }
    },


    /* ----------------- Constants ----------------- */

    CONST : {
        value : {
            STAGE_SHEET_ID        : 'nj-stage-stylesheet',
            DEFAULT_SHEET_ID      : 'nj-default-stylesheet',
            GARBAGE_SELECTOR      : 'ninja-garbage-selector',
            SPECIFICITY_KEY       : 'specificity',
            SPEC_ID_KEY           : 'id',
            SPEC_CLASS_KEY        : 'class',
            SPEC_TYPE_KEY         : 'type',
            IMPORTANT_FLAG        : '!important',
            GENERATED_CLASS       : 'gen',
            GENERATED_GROUP_CLASS : 'group'
        },
        enumerable : false
    },

    /* ----------------- Convenience functions for manual verifications ----------------- */
    
    test : {
        value : {
            getStyleTest : function() {
                var properties = ['background-position', 'width', 'height'];
                
                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');
                
                properties.forEach(function(prop) {
                    console.log('Getting value for "' + prop + '": ' + stylesController.getElementStyle(el, prop, true));
                }, this);

            },
            addRulesTest : function() {
                var rules = [
                    'div#Div_1 { background-color: black }',
                    '#UserContent div#Div_1 { background-color: blue }',
                    '#UserContent #Div_1 { background-color: white }',
                    'div div#Div_1 { background-color: red }'
                ];
                rules.forEach(function(rule) {
                    stylesController.addRule(rule);
                });
            },
            getMatchingRulesTest : function() {
                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1'),
                    mRules;
                    
                this.addRulesTest();
                
                mRules = stylesController.getMatchingRules(el, true);
                mRules.forEach(function(rule, i) {
                    console.log('Rule ' + i + ' selector: ' + rule.selectorText);
                });
            },
            setElementStyleTest : function() {
                ///// This test will get the initial background style of the element,
                ///// apply a new style using setElementStyle, and print out the new
                ///// value.
                
                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1'),
                    bg;
                
                console.log('----- Set Element Style Test -----');
                
                this.addRulesTest();
                
                bg = stylesController.getElementStyle(el, 'background-color');
                
                console.log('Initial background color is : ' +  bg);
                
                stylesController.setElementStyle(el, 'background-color', '#CCCCCC');
                
                bg = stylesController.getElementStyle(el, 'background-color');
                console.log('Final background color is : ' +  bg);
                
                console.log('......Set Element Style Test[END].....');
            },
            setElementStyle2Test : function() {
                // first, drag two divs on stage
                
                // create more specific, multi-target rule
                var rules = ['#UserContent div { background-color: blue }'];
                rules.forEach(function(rule) { stylesController.addRule(rule); });

                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');
                stylesController.setElementStyle(el, 'color', 'red');
                
                ///// the #Div_1 rule created by tag tool should have the color style
            },
            setElementStyle3Test : function() {
                ///// First, draw a div onto the stage
                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');

                //// now add a multi-target rule overriding the bg color
                var rules = [
                    '#UserContent div { background-color: blue }'
                ];

                ///// draw another div onto the stage

                rules.forEach(function(rule) {
                    stylesController.addRule(rule);
                });

                stylesController.setElementStyle(el, 'background-color', 'red');
            },
            setGroupStyleTest : function() {
                ///// draw 2 divs on stage
                var el1 = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');
                var el2 = stylesController.currentDocument.model.views.design.document.getElementById('Div_2');

                var dominantRule = stylesController.getDominantRuleForGroup([el1, el2], 'color');
            },
            setElementStylesTest : function() {
                ///// draw a div on stage
                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');
                
                mRules = stylesController.getMatchingRules(el, true);
                mRules.forEach(function(rule) {
                    console.log('Deleting Rule ' + i + ' selector: ' + rule.selectorText);
                    stylesController.deleteRule(rule);
                });
                
                stylesController.setElementStyles(el, {
                    'width':'100px',
                    'height':'100px',
                    'position':'absolute'
                });
            },
            createOverrideRuleTest : function() {
                ///// Draw div on stage
                                
                console.log('----- Create Override Rule Test -----');

                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1'),
                    rule = stylesController.addRule('#UserContent div { background-color: blue }'),
                    override;
                    
                console.log('Old rule\'s selector: ' + rule.selectorText);
                override = stylesController.createOverrideRule(rule, el);
                
                console.log('New rule\'s selector: ' + override.rule.selectorText);
                
            },
            deleteRulesTest : function() {
                // drag one div on stage
                var el = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');
                this.addRulesTest();
                
                mRules = stylesController.getMatchingRules(el, true);
                mRules.forEach(function(rule) {
                    console.log('Deleting Rule ' + i + ' selector: ' + rule.selectorText);
                    stylesController.deleteRule(rule);
                });
            },
            matchesElementsExclusivelyTest : function() {
                /// drag two divs on stage
                var rule = stylesController.addRule('#Div_1, #Div_3 { color:black; }');
                var el1 = stylesController.currentDocument.model.views.design.document.getElementById('Div_1');
                var el2 = stylesController.currentDocument.model.views.design.document.getElementById('Div_2');

                console.log('Does rule match elements exclusively? ' + stylesController.matchesElementsExclusively(rule, [el1, el2]));
            }
        }
    }
    
});