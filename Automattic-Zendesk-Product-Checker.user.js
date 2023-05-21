// ==UserScript==
// @name         Zendesk Product Checker
// @namespace    http://tampermonkey.net/
// @version      0.236
// @description  -----------------------------
// @author       Senff
// @require      https://code.jquery.com/jquery-1.12.4.js
// @downloadURL  https://github.com/senff/Automattic-Zendesk-Product-Checker/raw/main/Automattic-Zendesk-Product-Checker/Automattic-Zendesk-Product-Checker.user.js
// @updateURL    https://github.com/senff/Automattic-Zendesk-Product-Checker/raw/main/Automattic-Zendesk-Product-Checker/Automattic-Zendesk-Product-Checker.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zendesk.com
// @grant        GM_setClipboard
// ==/UserScript==

var $ = window.jQuery;

// === Add CSS styles on load ===================================================
    if(!$('#product-checker-styles').length) {
        $('body').append('<style type="text/css" id="product-checker">.hidden-ssr{position: absolute;visibility: hidden; width:1px; height: 1px; overflow: hidden;}.hie-all{display: none;}</style>');
    }

// === Add hidden textarea and product placeholders ===================================================
	function checkProducts() {
	    $('#main_panes .custom_field_22871957 textarea[data-tracking-id]').each(function(SSRticketTab) {

	        // Get the ID of this ticket and apply it to the original SSR box
	        var rawTicketID = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().attr('data-test-id');
	        rawTicketID = rawTicketID.replace('ticket-','');
	        var ticketID = rawTicketID.replace('-standard-layout','');
	        $(this).attr('product-checker-id',ticketID);

            // Check if there are two boxes and reset this bunch
            if ($(this).parent().parent().parent().parent().parent().find('.product-checker-box').length > 1) {
                $(this).parent().parent().parent().parent().parent().find('.product-checker-box').remove();
            }

	        // Check if there is a copied SSR box that has the same ID
	        var topPCID = $(this).parent().parent().parent().parent().parent().find('.product-checker-box').attr('data-pc-box');

	        if (($(this).parent().parent().parent().parent().parent().find('.product-checker-box').length != 1) && (topPCID != ticketID)) {
	            // There is no box, or there's more than one box, or the IDs don't match. Remove the box if there is one.
	            $(this).parent().parent().parent().parent().parent().find('.product-checker-box').remove();
	            $(this).parent().parent().parent().parent().parent().prepend('<div class="property_box product-checker-box" data-pc-box='+ticketID+' style="padding-top: 5px !important;"><div class="ember-view form_field brand_id"><div class="subs-sales-check"></div><div class="aw-sales-check"></div><div class="wcpay-check"></div><textarea class="hidden-ssr"></textarea></div></div></div>');
	        } else {
                // The box is there and the IDs match. Continue checking the SSR in the original box and copy it if needed.
	            var SSRcontent = $(this).text();
	            if ((SSRcontent == '') || (SSRcontent == 'Not required in this contact type')){
                    $(this).parent().parent().parent().parent().parent().find($('.product-checker-box textarea')).html('(SSR is empty)');
                } else {
	                // This may be the SSR. Or something else. Put contents of that field in the textarea above.
	                $(this).parent().parent().parent().parent().parent().find($('.product-checker-box textarea')).html(SSRcontent);
	            }
	            if (SSRcontent.indexOf('WordPress address (URL):') !== -1) {
	                // SSR exists and contains the word "WordPress", it looks like this is an actual SSR so activate the buttons
                    $(this).parent().parent().parent().parent().parent().find($('.product-checker-box textarea')).addClass('contains-SSR');
	                $(this).parent().parent().parent().parent().parent().find($('.product-checker-box .SSR-buttons')).show();
	            } else {
                    $(this).parent().parent().parent().parent().parent().find($('.product-checker-box textarea')).removeClass('contains-SSR');
                    $(this).parent().parent().parent().parent().parent().find($('.product-checker-box .SSR-buttons')).hide();
                }
            }
        });
        // Check if the products are listed in the SSR
	    $('.product-checker-box textarea').each(function(SSRsales) {
            var SSRsalescontent = $(this).text();
            if (SSRsalescontent.indexOf('WordPress address (URL):') !== -1) {
                if (SSRsalescontent.indexOf('WooCommerce Subscriptions') == -1) {
                    $(this).parent().find('.subs-sales-check').html('<strong style="color:#ff0000;">❌ Subscriptions</strong></br>');
                } else {
                    $(this).parent().find('.subs-sales-check').html('<strong style="color:#009900;">✅ Subscriptions</strong></br>');
                }
                if (SSRsalescontent.indexOf('AutomateWoo') == -1) {
                    $(this).parent().find('.aw-sales-check').html('<strong style="color:#ff0000;">❌ AutomateWoo</strong></br>');
                } else {
                    $(this).parent().find('.aw-sales-check').html('<strong style="color:#009900;">✅ AutomateWoo</strong></br>');
                }
                if (SSRsalescontent.indexOf('WooCommerce Payments') == -1) {
                    $(this).parent().find('.wcpay-check').html('<strong style="color:#ff0000;">❌ WC Payments</strong></br>');
                } else {
                    $(this).parent().find('.wcpay-check').html('<strong style="color:#009900;">✅ WC Payments</strong></br>');
                }
            } else {
                $(this).parent().find('.subs-sales-check, .aw-sales-check, .wcpay-check').html('');
            }
        });
	}


// Loop until textbox is fully loaded
window.setInterval(function(){
    checkProducts();
}, 1000);
