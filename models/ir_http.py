from odoo import models

class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'
    # Simple inheritance to ensure the module is seen as having python logic
    # and to force Odoo to recognize it during 'Update Apps List'
